"use client"

import dynamic from "next/dynamic"

import { Spinner } from "@/components/ui/spinner"
import type { PartCatalogEntry } from "@/lib/part-catalog"
import { cn } from "@/lib/utils"

const ModelViewerCanvas = dynamic(
  () =>
    import("@/components/canvas/model-viewer-canvas").then(
      (module) => module.ModelViewerCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-72 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm text-zinc-400">
        <Spinner className="size-4 text-primary" />
        Preparing 3D viewer
      </div>
    ),
  }
)

type ModelViewerProps = {
  src: string
  modelName: string
  selectedPartId?: string | null
  selectedLabel?: string | null
  parts?: PartCatalogEntry[]
  showObjectLabel?: boolean
  focusNonce?: number
  className?: string
  onIdentify?: (partId: string | null, gltfNodeName: string | null) => void
}

export function ModelViewer({
  src,
  modelName,
  selectedPartId,
  selectedLabel,
  parts,
  showObjectLabel,
  focusNonce,
  className,
  onIdentify,
}: ModelViewerProps) {
  return (
    <ModelViewerCanvas
      src={src}
      modelName={modelName}
      selectedPartId={selectedPartId}
      selectedLabel={selectedLabel}
      parts={parts}
      showObjectLabel={showObjectLabel}
      focusNonce={focusNonce}
      className={cn("h-full min-h-72", className)}
      onIdentify={onIdentify}
    />
  )
}
