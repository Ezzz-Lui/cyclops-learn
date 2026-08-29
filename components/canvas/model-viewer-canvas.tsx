"use client"

import { Bounds, ContactShadows, Html, OrbitControls, useBounds, useCursor, useGLTF, useProgress } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import {
  Component,
  Suspense,
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
  findBestPartForNodeNames,
  type PartCatalogEntry,
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

function resolveNodeName(object: THREE.Object3D) {
  return ancestorNames(object)[0] ?? "Unnamed"
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

function identifyPart(
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

function LoadedModel({
  src,
  parts,
  selectedPartId,
  showObjectLabel,
  focusNonce,
  markerPartIds,
  onIdentify,
}: {
  src: string
  parts: PartCatalogEntry[]
  selectedPartId?: string | null
  showObjectLabel: boolean
  focusNonce: number
  markerPartIds?: string[] | null
  onIdentify: (partId: string | null, gltfNodeName: string | null) => void
}) {
  const { scene } = useGLTF(src, true, true)
  const cloned = useMemo(() => scene.clone(true), [scene])
  const bounds = useBounds()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered, "pointer", "grab")

  const modelBox = useMemo(() => new THREE.Box3().setFromObject(cloned), [cloned])
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

  return (
    <>
      <primitive
        object={cloned}
        onClick={(event: {
          object: THREE.Object3D
          point: THREE.Vector3
          stopPropagation: () => void
        }) => {
          event.stopPropagation()
          const names = ancestorNames(event.object)
          const nodeName = names[0] ?? "Unnamed"
          const match = identifyPart(parts, modelBox, event.point, names)
          onIdentify(match?.id ?? null, nodeName)
        }}
        onDoubleClick={(event: { object: THREE.Object3D; stopPropagation: () => void }) => {
          event.stopPropagation()
          bounds.refresh(event.object).fit()
        }}
        onPointerMissed={() => onIdentify(null, null)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
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
  }, [bounds, box, focusNonce, parts, radius, selectedPartId])

  return null
}

function FitReporter({
  fitRef,
}: {
  fitRef: MutableRefObject<(() => void) | null>
}) {
  const bounds = useBounds()

  useEffect(() => {
    fitRef.current = () => {
      bounds.refresh().clip().fit()
    }
  }, [bounds, fitRef])

  return null
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

  useEffect(() => {
    onIdentifyRef.current?.(null, null)
  }, [src])

  return (
    <div
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
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          onPointerMissed={() => onIdentifyRef.current?.(null, null)}
        >
          <color attach="background" args={["#09090b"]} />
          <hemisphereLight args={["#f8fafc", "#1c1917", 0.7]} />
          <directionalLight position={[6, 8, 4]} intensity={1.35} />
          <directionalLight position={[-5, 2, -3]} intensity={0.35} />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.25}>
              <LoadedModel
                src={src}
                parts={parts}
                selectedPartId={selectedPartId}
                showObjectLabel={showObjectLabel}
                focusNonce={focusNonce}
                markerPartIds={markerPartIds}
                onIdentify={(partId, nodeName) => onIdentifyRef.current?.(partId, nodeName)}
              />
              <FitReporter fitRef={fitRef} />
            </Bounds>
            <ContactShadows opacity={0.4} scale={16} blur={1.8} far={8} />
          </Suspense>
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={0.2}
            maxDistance={40}
          />
        </Canvas>
      </ViewerErrorBoundary>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <p className="rounded-lg bg-black/45 px-2 py-1 text-[11px] text-zinc-300 backdrop-blur-sm">
          {modelName}
        </p>
        <Button
          type="button"
          size="xs"
          variant="secondary"
          className="pointer-events-auto"
          onClick={() => fitRef.current?.()}
        >
          Reset view
        </Button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <p className="text-[11px] text-zinc-500">
          All part names are on · send a photo if a label is in the wrong place
        </p>
        {selectedLabel ? (
          <p className="rounded-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
            {selectedLabel}
          </p>
        ) : null}
      </div>
    </div>
  )
}
