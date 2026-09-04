"use client"

import { Bounds, ContactShadows, Html, OrbitControls, useBounds, useCursor, useGLTF, useProgress } from "@react-three/drei"
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber"
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type MutableRefObject,
  type ReactNode,
} from "react"
import * as THREE from "three"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  is3dMetricsQueryEnabled,
  is3dOptimizationEnabled,
  modelFilenameFromSrc,
} from "@/lib/3d-optimization"
import {
  applyQualityBand,
  classifyFpsBand,
  createQualityGovernorState,
  downloadJson,
  dprForTier,
  MetricsSession,
  QUALITY_WINDOW_MS,
  type Cyclops3dHarness,
  type QualityTier,
} from "@/lib/3d-performance"
import { resolvePointerPick, type LocalBox } from "@/lib/3d-picking"
import {
  findBestPartForNodeNames,
  getPickingConfig,
  type PartCatalogEntry,
  type PickingConfig,
  type Vec3Tuple,
} from "@/lib/part-catalog"
import { cn } from "@/lib/utils"

type ModelViewerCanvasProps = {
  src: string
  modelName: string
  selectedPartId?: string | null
  selectedLabel?: string | null
  parts?: PartCatalogEntry[]
  showObjectLabel?: boolean
  focusNonce?: number
  /** null/undefined shows every marker; an array shows only those part ids. */
  markerPartIds?: string[] | null
  className?: string
  onIdentify?: (partId: string | null, gltfNodeName: string | null) => void
}

function ancestorNames(object: THREE.Object3D) {
  const names: string[] = []
  let current: THREE.Object3D | null = object
  while (current) {
    if (current.name) {
      names.push(current.name)
    }
    current = current.parent
  }
  return names
}

function worldAnchor(part: PartCatalogEntry, box: THREE.Box3) {
  if (part.anchor?.length === 3) {
    return new THREE.Vector3(part.anchor[0], part.anchor[1], part.anchor[2])
  }
  if (part.anchorNorm?.length === 3) {
    const size = box.getSize(new THREE.Vector3())
    return new THREE.Vector3(
      box.min.x + size.x * part.anchorNorm[0],
      box.min.y + size.y * part.anchorNorm[1],
      box.min.z + size.z * part.anchorNorm[2]
    )
  }
  return null
}

function localBoxFromObject(root: THREE.Object3D): LocalBox {
  root.updateWorldMatrix(true, true)
  const worldBox = new THREE.Box3().setFromObject(root)
  const inverse = new THREE.Matrix4().copy(root.matrixWorld).invert()
  const local = worldBox.clone().applyMatrix4(inverse)
  const size = local.getSize(new THREE.Vector3())
  return {
    min: [local.min.x, local.min.y, local.min.z],
    size: [size.x, size.y, size.z],
  }
}

function vec3Tuple(vector: THREE.Vector3): Vec3Tuple {
  return [vector.x, vector.y, vector.z]
}

function identifyPartLegacy(
  parts: PartCatalogEntry[],
  box: THREE.Box3,
  point: THREE.Vector3,
  nodeNames: string[]
) {
  const mapped = findBestPartForNodeNames(parts, nodeNames)
  if (mapped) return mapped

  let best: PartCatalogEntry | null = null
  let bestDist = Infinity
  for (const part of parts) {
    const anchor = worldAnchor(part, box)
    if (!anchor) continue
    const distance = anchor.distanceTo(point)
    if (distance < bestDist) {
      bestDist = distance
      best = part
    }
  }
  return best
}

function gpuRendererName(gl: THREE.WebGLRenderer) {
  const context = gl.getContext()
  const debug = context.getExtension("WEBGL_debug_renderer_info")
  if (!debug) return "unknown"
  const renderer = context.getParameter(debug.UNMASKED_RENDERER_WEBGL)
  return typeof renderer === "string" ? renderer : "unknown"
}

function LoadedModel({
  src,
  parts,
  selectedPartId,
  showObjectLabel,
  focusNonce,
  markerPartIds,
  optimized,
  picking,
  metrics,
  onIdentify,
  onSceneReady,
  onPick,
}: {
  src: string
  parts: PartCatalogEntry[]
  selectedPartId?: string | null
  showObjectLabel: boolean
  focusNonce: number
  markerPartIds?: string[] | null
  optimized: boolean
  picking: PickingConfig | null
  metrics: MetricsSession | null
  onIdentify: (partId: string | null, gltfNodeName: string | null) => void
  onSceneReady: () => void
  onPick: (result: ReturnType<typeof resolvePointerPick>) => void
}) {
  const { scene } = useGLTF(src, true, true)
  void showObjectLabel
  const cloned = useMemo(() => scene.clone(true), [scene])
  const bounds = useBounds()
  const invalidate = useThree((state) => state.invalidate)
  const [hovered, setHovered] = useState(false)
  useCursor(!optimized && hovered, "pointer", "grab")

  const modelBox = useMemo(() => new THREE.Box3().setFromObject(cloned), [cloned])
  const localBox = useMemo(() => localBoxFromObject(cloned), [cloned])
  const highlightRadius = useMemo(
    () => modelBox.getSize(new THREE.Vector3()).length() * 0.18,
    [modelBox]
  )

  useEffect(() => {
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [cloned])

  useEffect(() => {
    invalidate()
    onSceneReady()
  }, [cloned, invalidate, onSceneReady])

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation()
    const names = ancestorNames(event.object)
    const nodeName = names[0] ?? "Unnamed"

    if (!optimized) {
      metrics?.recordPointerRaycast()
      const match = identifyPartLegacy(parts, modelBox, event.point, names)
      onIdentify(match?.id ?? null, nodeName)
      onPick({
        method: match ? "anchor" : "null",
        partId: match?.id ?? null,
        gltfNodeName: nodeName,
      })
      return
    }

    metrics?.recordPointerRaycast()
    const localPoint = cloned.worldToLocal(event.point.clone())
    const result = resolvePointerPick({
      button: event.button,
      delta: event.delta,
      parts,
      point: vec3Tuple(localPoint),
      ancestorNames: names,
      picking,
      localBox,
    })
    onPick(result)
    metrics?.recordResolution(result)
    if (result.method === "ignore" || result.method === "drag" || result.method === "null") {
      return
    }
    onIdentify(result.partId, result.gltfNodeName ?? nodeName)
  }

  return (
    <>
      <primitive
        object={cloned}
        onClick={handleClick}
        onDoubleClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation()
          bounds.refresh(event.object).fit()
          invalidate()
        }}
        {...(!optimized
          ? {
              onPointerMissed: () => onIdentify(null, null),
              onPointerOver: () => {
                metrics?.recordPointerRaycast()
                setHovered(true)
              },
              onPointerOut: () => setHovered(false),
            }
          : {})}
      />
      <PartMarkers
        parts={parts}
        box={modelBox}
        selectedPartId={selectedPartId ?? null}
        markerPartIds={markerPartIds ?? null}
      />
      <FocusOnPart
        parts={parts}
        box={modelBox}
        selectedPartId={selectedPartId ?? null}
        radius={highlightRadius}
        focusNonce={focusNonce}
      />
    </>
  )
}

function PartMarkers({
  parts,
  box,
  selectedPartId,
  markerPartIds,
}: {
  parts: PartCatalogEntry[]
  box: THREE.Box3
  selectedPartId: string | null
  markerPartIds: string[] | null
}) {
  return (
    <>
      {parts.map((part) => {
        if (markerPartIds && !markerPartIds.includes(part.id)) return null
        const position = worldAnchor(part, box)
        if (!position) return null
        const selected = part.id === selectedPartId
        return (
          <Html
            key={part.id}
            position={position}
            center
            zIndexRange={[120, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div
              className={cn(
                "whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold shadow-md",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/20 bg-zinc-950/90 text-zinc-50"
              )}
            >
              {part.diagramIndex != null ? `${part.diagramIndex} · ` : ""}
              {part.label}
            </div>
          </Html>
        )
      })}
    </>
  )
}

function FocusOnPart({
  parts,
  box,
  selectedPartId,
  radius,
  focusNonce,
}: {
  parts: PartCatalogEntry[]
  box: THREE.Box3
  selectedPartId: string | null
  radius: number
  focusNonce: number
}) {
  const bounds = useBounds()
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!selectedPartId || focusNonce === 0) return
    const part = parts.find((entry) => entry.id === selectedPartId)
    const anchor = part ? worldAnchor(part, box) : null
    if (!anchor) return
    const focus = new THREE.Box3().setFromCenterAndSize(
      anchor,
      new THREE.Vector3(radius, radius, radius)
    )
    bounds.refresh(focus).fit()
    invalidate()
  }, [bounds, box, focusNonce, invalidate, parts, radius, selectedPartId])

  return null
}

function FitReporter({
  fitRef,
}: {
  fitRef: MutableRefObject<(() => void) | null>
}) {
  const bounds = useBounds()
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    fitRef.current = () => {
      bounds.refresh().clip().fit()
      invalidate()
    }
  }, [bounds, fitRef, invalidate])

  return null
}

function InvalidateOnResize() {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const onResize = () => invalidate()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [invalidate])

  return null
}

function FrameInstrumentation({
  metrics,
  enabled,
}: {
  metrics: MetricsSession | null
  enabled: boolean
}) {
  const gl = useThree((state) => state.gl)

  useFrame((state, delta) => {
    if (!enabled || !metrics) return
    metrics.recordFrameTime(delta * 1000)
    metrics.setDrawCalls(state.gl.info.render.calls)
    metrics.setDpr(state.gl.getPixelRatio())
  })

  useEffect(() => {
    if (!enabled || !metrics) return
    metrics.setEnvironment({ gpu: gpuRendererName(gl) })
  }, [enabled, gl, metrics])

  return null
}

function QualityGovernor({
  enabled,
  onTier,
}: {
  enabled: boolean
  onTier: (tier: QualityTier) => void
}) {
  const invalidate = useThree((state) => state.invalidate)
  const stateRef = useRef(createQualityGovernorState())
  const accRef = useRef({ time: 0, frames: 0 })

  useFrame((_, delta) => {
    if (!enabled || stateRef.current.locked) return
    accRef.current.time += delta
    accRef.current.frames += 1
    if (accRef.current.time * 1000 < QUALITY_WINDOW_MS) return
    const fps = accRef.current.frames / accRef.current.time
    const next = applyQualityBand(stateRef.current, classifyFpsBand(fps, 60))
    const changed = next.tier !== stateRef.current.tier || next.locked !== stateRef.current.locked
    stateRef.current = next
    accRef.current = { time: 0, frames: 0 }
    if (changed) {
      queueMicrotask(() => onTier(next.tier))
      invalidate()
    }
  })

  return null
}

function RestFrameProbe({
  metrics,
  enabled,
  restToken,
}: {
  metrics: MetricsSession | null
  enabled: boolean
  restToken: number
}) {
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    if (!enabled || !metrics) return
    let sampleTimer: number | undefined
    const warmupTimer = window.setTimeout(() => {
      const start = gl.info.render.frame
      sampleTimer = window.setTimeout(() => {
        metrics.setRestFrames(Math.max(0, gl.info.render.frame - start))
      }, 2000)
    }, 500)
    return () => {
      window.clearTimeout(warmupTimer)
      if (sampleTimer !== undefined) window.clearTimeout(sampleTimer)
    }
  }, [enabled, gl, metrics, restToken])

  return null
}

function ViewerOrbitControls({ onRest }: { onRest: () => void }) {
  const invalidate = useThree((state) => state.invalidate)

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={0.2}
      maxDistance={40}
      onStart={() => invalidate()}
      onChange={() => invalidate()}
      onEnd={() => {
        invalidate()
        onRest()
      }}
    />
  )
}

function LoadStatus() {
  const { active, progress } = useProgress()

  if (!active) return null

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-zinc-950/80 text-sm text-zinc-300">
      <Spinner className="size-5 text-primary" />
      <p>Loading model {Math.round(progress)}%</p>
    </div>
  )
}

class ViewerErrorBoundary extends Component<
  { children: ReactNode; resetKey: string },
  { error: string | null }
> {
  state = { error: null as string | null }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message || "Could not load this model." }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Model viewer failed", error, info)
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-sm text-zinc-400">
          Could not load this GLB. Check the file in <code className="mx-1">3Dmodels/</code> and try again.
        </div>
      )
    }
    return this.props.children
  }
}

export function ModelViewerCanvas({
  src,
  modelName,
  selectedPartId,
  selectedLabel,
  parts = [],
  showObjectLabel = false,
  focusNonce = 0,
  markerPartIds,
  className,
  onIdentify,
}: ModelViewerCanvasProps) {
  const fitRef = useRef<(() => void) | null>(null)
  const onIdentifyRef = useRef(onIdentify)
  onIdentifyRef.current = onIdentify

  const modelFilename = modelFilenameFromSrc(src)
  const optimized = is3dOptimizationEnabled(modelFilename)
  const picking = getPickingConfig(modelFilename)
  const metricsEnabled = is3dMetricsQueryEnabled()
  const devicePixelRatio =
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

  const [qualityTier, setQualityTier] = useState<QualityTier>("high")
  const [restToken, setRestToken] = useState(0)
  const [canvasReady, setCanvasReady] = useState(false)
  const [lastMethod, setLastMethod] = useState("")
  const lastPickRef = useRef<Cyclops3dHarness["lastPick"]>(null)

  const metrics = useMemo(
    () =>
      new MetricsSession({
        model: modelFilename,
        route: typeof window !== "undefined" ? window.location.pathname : "/canvas",
        browser: typeof navigator !== "undefined" ? navigator.userAgent : null,
        viewport:
          typeof window !== "undefined"
            ? { width: window.innerWidth, height: window.innerHeight }
            : null,
      }),
    [modelFilename]
  )

  useEffect(() => {
    metrics.setQualityTier(qualityTier)
    metrics.setDpr(dprForTier(qualityTier, devicePixelRatio))
  }, [devicePixelRatio, metrics, qualityTier])

  useEffect(() => {
    onIdentifyRef.current?.(null, null)
    setCanvasReady(false)
  }, [src])

  const handleSceneReady = useCallback(() => {
    setCanvasReady(true)
  }, [])

  const applyPick = useCallback((result: ReturnType<typeof resolvePointerPick>) => {
    if (result.method === "ignore") return
    lastPickRef.current = result
    setLastMethod(result.method)
  }, [])

  const simulatePointer = useCallback<Cyclops3dHarness["simulatePointer"]>(
    (input) => {
      if (!optimized) {
        const intent = input.button !== undefined && input.button !== 0 ? "ignore" : input.delta > 4 ? "drag" : "click"
        if (intent === "ignore") return { method: "ignore" as const }
        if (intent === "drag") {
          const drag = { method: "drag" as const, partId: null, gltfNodeName: null }
          applyPick(drag)
          metrics.recordResolution(drag)
          return drag
        }
        let best: PartCatalogEntry | null = null
        let bestDist = Infinity
        for (const part of parts) {
          if (part.anchor?.length !== 3) continue
          const dx = part.anchor[0]! - input.point[0]
          const dy = part.anchor[1]! - input.point[1]
          const dz = part.anchor[2]! - input.point[2]
          const distance = Math.hypot(dx, dy, dz)
          if (distance < bestDist) {
            bestDist = distance
            best = part
          }
        }
        const mapped = parts.find((part) =>
          (input.ancestors ?? []).some((name) =>
            part.nodes.some((token) => name === token || name.startsWith(token))
          )
        )
        const match = mapped ?? best
        const result = {
          method: match ? ("anchor" as const) : ("null" as const),
          partId: match?.id ?? null,
          gltfNodeName: input.ancestors?.[0] ?? null,
        }
        applyPick(result)
        metrics.recordResolution(result)
        onIdentifyRef.current?.(result.partId, result.gltfNodeName)
        return result
      }

      const result = resolvePointerPick({
        button: input.button ?? 0,
        delta: input.delta,
        parts,
        point: input.point,
        ancestorNames: input.ancestors ?? [],
        picking,
        localBox: {
          min: [0, 0, 0],
          size: [1, 1, 1],
        },
      })
      applyPick(result)
      metrics.recordResolution(result)
      if (result.method === "exact" || result.method === "hit" || result.method === "anchor") {
        onIdentifyRef.current?.(result.partId, result.gltfNodeName)
      }
      return result
    },
    [applyPick, metrics, optimized, parts, picking]
  )

  useEffect(() => {
    const existing = window.__cyclops3d
    if (existing?.ready) {
      existing.canvasReady = canvasReady
      existing.optimized = optimized
      existing.model = modelFilename
      existing.snapshot = () => {
        metrics.setEnvironment({
          browser: navigator.userAgent,
          viewport: { width: window.innerWidth, height: window.innerHeight },
        })
        return metrics.snapshot()
      }
      return
    }

    const harness: Cyclops3dHarness = {
      ready: true,
      canvasReady,
      model: modelFilename,
      optimized,
      get lastPick() {
        return lastPickRef.current
      },
      simulatePointer,
      snapshot: () => {
        metrics.setEnvironment({
          browser: navigator.userAgent,
          viewport: { width: window.innerWidth, height: window.innerHeight },
        })
        return metrics.snapshot()
      },
    }
    window.__cyclops3d = harness
    return () => {
      if (window.__cyclops3d === harness) {
        delete window.__cyclops3d
      }
    }
  }, [canvasReady, metrics, modelFilename, optimized, simulatePointer])

  const dpr = optimized
    ? dprForTier(qualityTier, devicePixelRatio)
    : ([1, 1.75] as [number, number])

  return (
    <div
      data-testid="model-viewer"
      data-optimized={optimized ? "true" : "false"}
      data-pick-method={lastMethod}
      className={cn(
        "relative min-h-0 cursor-grab overflow-hidden rounded-xl bg-zinc-950 active:cursor-grabbing",
        className
      )}
    >
      <LoadStatus />
      <ViewerErrorBoundary resetKey={src}>
        <Canvas
          className="absolute inset-0 h-full w-full"
          camera={{ position: [2.4, 1.6, 2.8], fov: 40, near: 0.01, far: 200 }}
          dpr={dpr}
          frameloop={optimized ? "demand" : "always"}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          onPointerMissed={
            optimized ? undefined : () => onIdentifyRef.current?.(null, null)
          }
        >
          <color attach="background" args={["#09090b"]} />
          <hemisphereLight args={["#f8fafc", "#1c1917", 0.7]} />
          <directionalLight position={[6, 8, 4]} intensity={1.35} />
          <directionalLight position={[-5, 2, -3]} intensity={0.35} />
          <InvalidateOnResize />
          <FrameInstrumentation metrics={metrics} enabled={optimized || metricsEnabled} />
          {optimized ? (
            <QualityGovernor
              enabled
              onTier={(tier) => {
                setQualityTier(tier)
                metrics.setQualityTier(tier)
              }}
            />
          ) : null}
          <RestFrameProbe
            metrics={metrics}
            enabled={optimized || metricsEnabled}
            restToken={restToken}
          />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.25}>
              <LoadedModel
                src={src}
                parts={parts}
                selectedPartId={selectedPartId}
                showObjectLabel={showObjectLabel}
                focusNonce={focusNonce}
                markerPartIds={markerPartIds}
                optimized={optimized}
                picking={picking}
                metrics={metrics}
                onIdentify={(partId, nodeName) => onIdentifyRef.current?.(partId, nodeName)}
                onSceneReady={handleSceneReady}
                onPick={applyPick}
              />
              <FitReporter fitRef={fitRef} />
            </Bounds>
            {optimized ? (
              qualityTier === "high" ? (
                <ContactShadows
                  frames={1}
                  resolution={256}
                  opacity={0.4}
                  scale={16}
                  blur={1.8}
                  far={8}
                />
              ) : null
            ) : (
              <ContactShadows opacity={0.4} scale={16} blur={1.8} far={8} />
            )}
          </Suspense>
          <ViewerOrbitControls onRest={() => setRestToken((value) => value + 1)} />
        </Canvas>
      </ViewerErrorBoundary>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <p className="rounded-lg bg-black/45 px-2 py-1 text-[11px] text-zinc-300 backdrop-blur-sm">
          {modelName}
        </p>
        <div className="pointer-events-auto flex items-center gap-2">
          {metricsEnabled ? (
            <Button
              type="button"
              size="xs"
              variant="outline"
              data-testid="download-3d-metrics"
              onClick={() =>
                downloadJson(
                  `3d-metrics-${modelFilename.replace(/\.glb$/i, "")}.json`,
                  metrics.snapshot()
                )
              }
            >
              Download 3D metrics
            </Button>
          ) : null}
          <Button
            type="button"
            size="xs"
            variant="secondary"
            data-testid="reset-view"
            onClick={() => fitRef.current?.()}
          >
            Reset view
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <p className="text-[11px] text-zinc-500">
          All part names are on · send a photo if a label is in the wrong place
        </p>
        {selectedLabel ? (
          <p
            data-testid="selected-part-label"
            className="rounded-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
          >
            {selectedLabel}
          </p>
        ) : null}
      </div>
    </div>
  )
}
