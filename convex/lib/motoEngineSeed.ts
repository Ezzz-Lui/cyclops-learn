import { getFormBySlug, listFormParts } from "../forms/registry"
import type { Form3DData } from "../forms/types"

export const MOTO_ENGINE_SLUG = "moto-engine"

function requireMotoForm(): Form3DData {
  const form = getFormBySlug(MOTO_ENGINE_SLUG)
  if (!form) {
    throw new Error("Missing 3d-form.moto-engine.explore.data")
  }
  return form
}

const form = requireMotoForm()

export const MOTO_ENGINE_OVERVIEW = form.overview
export const ICE_SYSTEMS = form.systems
export const CURATED_PARTS = form.parts

export function motoEngineNodes() {
  return listFormParts(form).map((part) => part.gltfNodeName)
}

export function motoEngineParts() {
  return listFormParts(form)
}
