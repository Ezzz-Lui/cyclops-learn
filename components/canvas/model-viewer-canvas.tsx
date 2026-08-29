"use client"

import { Bounds, ContactShadows, OrbitControls, useBounds, useCursor, useGLTF, useProgress } from "@react-three/drei"
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
import { cn } from "@/lib/utils"

type ModelViewerCanvasProps = {
  src: string
  modelName: string
  selectedLabel?: string | null
  className?: string
  onSelectNode?: (gltfNodeName: string | null) => void
}

function resolveNodeName(object: THREE.Object3D) {
  let current: THREE.Object3D | null = object
  while (current) {
    if (current.name) {
      return current.name
    }
    current = current.parent
  }
  return "Unnamed"
}

type SelectedPart = {
  name: string
  object: THREE.Object3D
}

const SELECT_COLOR = new THREE.Color("#84cc16")

function humanizeName(name: string) {
  const cleaned = name.replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim()
  return cleaned || "Unnamed part"
}

function applyHighlight(object: THREE.Object3D | null, enabled: boolean) {
  if (!object) return

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return

    const materials = Array.isArray(child.material) ? child.material : [child.material]
    for (const material of materials) {
      if (!material || !("emissive" in material)) continue
      const colored = material as THREE.MeshStandardMaterial
      if (!colored.userData._originalEmissive) {
        colored.userData._originalEmissive = colored.emissive.clone()
        colored.userData._originalEmissiveIntensity = colored.emissiveIntensity
      }
      if (enabled) {
        colored.emissive.copy(SELECT_COLOR)
        colored.emissiveIntensity = 0.45
      } else {
        colored.emissive.copy(colored.userData._originalEmissive)
        colored.emissiveIntensity = colored.userData._originalEmissiveIntensity ?? 1
      }
    }
  })
}

function LoadedModel({
  src,
  onSelect,
}: {
  src: string
  onSelect: (part: SelectedPart | null) => void
}) {
  const { scene } = useGLTF(src, true, true)
  const cloned = useMemo(() => scene.clone(true), [scene])
  const bounds = useBounds()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered, "pointer", "grab")

  useEffect(() => {
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [cloned])

  return (
    <primitive
      object={cloned}
      onClick={(event: { object: THREE.Object3D; stopPropagation: () => void }) => {
        event.stopPropagation()
        onSelect({
          name: resolveNodeName(event.object),
          object: event.object,
        })
      }}
      onDoubleClick={(event: { object: THREE.Object3D; stopPropagation: () => void }) => {
        event.stopPropagation()
        bounds.refresh(event.object).fit()
      }}
      onPointerMissed={() => onSelect(null)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  )
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
  selectedLabel,
  className,
  onSelectNode,
}: ModelViewerCanvasProps) {
  const [selected, setSelected] = useState<SelectedPart | null>(null)
  const selectedRef = useRef<THREE.Object3D | null>(null)
  const fitRef = useRef<(() => void) | null>(null)
  const onSelectNodeRef = useRef(onSelectNode)
  onSelectNodeRef.current = onSelectNode

  function handleSelect(part: SelectedPart | null) {
    setSelected(part)
    onSelectNodeRef.current?.(part?.name ?? null)
  }

  useEffect(() => {
    setSelected(null)
    applyHighlight(selectedRef.current, false)
    selectedRef.current = null
    onSelectNodeRef.current?.(null)
  }, [src])

  useEffect(() => {
    applyHighlight(selectedRef.current, false)
    selectedRef.current = selected?.object ?? null
    applyHighlight(selectedRef.current, true)

    return () => {
      applyHighlight(selectedRef.current, false)
    }
  }, [selected])

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
          onPointerMissed={() => handleSelect(null)}
        >
          <color attach="background" args={["#09090b"]} />
          <hemisphereLight args={["#f8fafc", "#1c1917", 0.7]} />
          <directionalLight position={[6, 8, 4]} intensity={1.35} />
          <directionalLight position={[-5, 2, -3]} intensity={0.35} />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.25}>
              <LoadedModel src={src} onSelect={handleSelect} />
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
          Drag to orbit · scroll to zoom · right-drag to pan
          <span className="hidden sm:inline"> · double-click a part to focus</span>
        </p>
        {selected ? (
          <p className="rounded-lg bg-black/45 px-2 py-1 text-[11px] text-primary backdrop-blur-sm">
            {selectedLabel ?? humanizeName(selected.name)}
          </p>
        ) : null}
      </div>
    </div>
  )
}
