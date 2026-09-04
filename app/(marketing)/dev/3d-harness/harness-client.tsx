"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import { ModelViewer } from "@/components/canvas/model-viewer"
import { Button } from "@/components/ui/button"
import { is3dOptimizationEnabled } from "@/lib/3d-optimization"
import type { Cyclops3dHarness } from "@/lib/3d-performance"
import { resolvePointerPick } from "@/lib/3d-picking"
import { getModelSrc } from "@/lib/model-catalog"
import { findPartById, getPartCatalog, getPickingConfig } from "@/lib/part-catalog"

const DEFAULT_MODEL = "transmission_model_for_3d_printing.glb"

export function HarnessClient() {
  const searchParams = useSearchParams()
  const modelFile = searchParams.get("model") || DEFAULT_MODEL
  const catalog = useMemo(() => getPartCatalog(modelFile), [modelFile])
  const picking = getPickingConfig(modelFile)
  const [pickedPartId, setPickedPartId] = useState<string | null>(null)
  const [focusNonce, setFocusNonce] = useState(0)

  const selected = pickedPartId ? findPartById(modelFile, pickedPartId) : null
  const parts = catalog?.parts ?? []

  useEffect(() => {
    const previous = window.__cyclops3d
    const harness: Cyclops3dHarness = {
      ready: true,
      canvasReady: previous?.canvasReady ?? false,
      model: modelFile,
      optimized: is3dOptimizationEnabled(modelFile),
      lastPick: previous?.lastPick ?? null,
      simulatePointer: (input) => {
        const result = resolvePointerPick({
          button: input.button ?? 0,
          delta: input.delta,
          parts,
          point: input.point,
          ancestorNames: input.ancestors ?? [],
          picking,
        })
        if (result.method !== "ignore") {
          harness.lastPick = result
        }
        if (result.method === "exact" || result.method === "hit" || result.method === "anchor") {
          setPickedPartId(result.partId)
        }
        return result
      },
      snapshot: () =>
        previous?.snapshot() ?? {
          comparable: false,
          missing: ["frameTimeP95Ms"],
          browser: navigator.userAgent,
          gpu: null,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          model: modelFile,
          route: window.location.pathname,
          frameTimeP95Ms: null,
          dpr: null,
          qualityTier: null,
          pointerRaycasts: 0,
          restFramesAfter2s: null,
          drawCalls: null,
          picking: { exact: 0, hit: 0, anchor: 0, null: 0, drag: 0 },
        },
    }
    window.__cyclops3d = harness
    return () => {
      if (window.__cyclops3d === harness) {
        delete window.__cyclops3d
      }
    }
  }, [modelFile, parts, picking])

  return (
    <main className="flex min-h-[calc(100svh-4.5rem)] flex-col gap-3 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground" data-testid="harness-ready">
          3D harness · {modelFile}
        </p>
        <Button
          type="button"
          size="xs"
          variant="outline"
          data-testid="focus-selected"
          onClick={() => {
            if (!pickedPartId) {
              setPickedPartId(catalog?.parts[0]?.id ?? null)
            }
            setFocusNonce((value) => value + 1)
          }}
        >
          Focus selected
        </Button>
      </div>
      <ModelViewer
        src={getModelSrc(modelFile)}
        modelName={catalog?.title ?? modelFile}
        parts={parts}
        selectedPartId={pickedPartId}
        selectedLabel={selected?.label ?? null}
        focusNonce={focusNonce}
        className="min-h-[70vh] flex-1"
        onIdentify={(partId) => setPickedPartId(partId)}
      />
    </main>
  )
}
