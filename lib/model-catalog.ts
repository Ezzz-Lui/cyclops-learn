export const MODELS_API_PREFIX = "/api/models"

export const DEFAULT_MODEL_FILE = "internal_combustion_engine_moto.glb"

/** Project-specific GLB files in `/3Dmodels`. Unmapped projects use the reference model. */
export const PROJECT_MODEL_FILES: Record<string, string> = {
  "moto-engine": DEFAULT_MODEL_FILE,
  "city-bike": DEFAULT_MODEL_FILE,
}

export function getProjectModelFile(projectId: string) {
  return PROJECT_MODEL_FILES[projectId] ?? DEFAULT_MODEL_FILE
}

export function getModelSrc(filename: string) {
  return `${MODELS_API_PREFIX}/${encodeURIComponent(filename)}`
}

export function resolveProjectModelFile(
  projectId: string,
  available: string[]
) {
  const preferred = getProjectModelFile(projectId)
  if (available.includes(preferred)) {
    return preferred
  }
  return available[0] ?? preferred
}
