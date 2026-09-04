"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"

import { Spinner } from "@/components/ui/spinner"
import type { PartCatalogEntry } from "@/lib/part-catalog"
import { cn } from "@/lib/utils"

function ViewerLoading() {
  const t = useTranslations("Canvas")
  return (
    <div className="flex min-h-72 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm text-zinc-400">
      <Spinner className="size-4 text-primary" />
      {t("preparingViewer")}
    </div>
  )
}

const ModelViewerCanvas = dynamic(
  () =>
    import("@/components/canvas/model-viewer-canvas").then(
      (module) => module.ModelViewerCanvas
    ),
  {
    ssr: false,
    loading: () => <ViewerLoading />,
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
  /** null/undefined shows every marker; an array shows only those part ids. */
  markerPartIds?: string[] | null
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
  markerPartIds,
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
      markerPartIds={markerPartIds}
      className={cn("h-full min-h-72", className)}
      onIdentify={onIdentify}
    />
  )
}
