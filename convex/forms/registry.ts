import motoEngineExplore from "./3d-form.moto-engine.explore.data"
import type { Form3DData, FormActivity, FormPart, FormUseCase } from "./types"
import { expandMeshIndex, humanizeNode } from "./types"

const FORMS: Form3DData[] = [motoEngineExplore]

export function getForm(slug: string, useCase: FormUseCase) {
  return FORMS.find((form) => form.slug === slug && form.useCase === useCase) ?? null
}

export function getFormBySlug(slug: string) {
  return FORMS.find((form) => form.slug === slug) ?? null
}

export function listFormParts(form: Form3DData) {
  return expandMeshIndex(form.meshIndex).map((gltfNodeName) => {
    const curated = form.parts[gltfNodeName]
    if (curated) {
      return {
        gltfNodeName,
        label: curated.label,
        layer: curated.layer,
        summary: curated.summary,
        teachable: true,
      }
    }
    return {
      gltfNodeName,
      label: humanizeNode(gltfNodeName),
      layer: "assembly",
      summary: form.unlabeledSummary,
      teachable: false,
    }
  })
}

export function pickActivity(
  form: Form3DData,
  part: { gltfNodeName: string; layer?: string; teachable: boolean } | null
): FormActivity | null {
  if (part?.teachable) {
    const curated: FormPart | undefined = form.parts[part.gltfNodeName]
    const partMove = curated?.interactions?.[0]
    if (partMove) {
      return partMove
    }
  }

  if (part?.layer && part.layer !== "assembly") {
    const layered = form.activities.find((activity) => activity.targetLayer === part.layer)
    if (layered) {
      return layered
    }
  }

  return form.activities[0] ?? null
}
