export const MODELS_API_PREFIX = "/api/models"

export const DEFAULT_MODEL_FILE = "internal_combustion_engine_moto.glb"

/** Project-specific GLB files in `/3Dmodels`. Unmapped projects use the reference model. */
export const PROJECT_MODEL_FILES: Record<string, string> = {
  "moto-engine": DEFAULT_MODEL_FILE,
  "city-bike": DEFAULT_MODEL_FILE,
  transmission: "transmission_model_for_3d_printing.glb",
  motherboard: "motherboard__components.glb",
  server: "server_v2_console.glb",
  "living-room": "living_room.glb",
  bamboo: "bamboo_structural_system.glb",
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
