import { readdir } from "node:fs/promises"
import path from "node:path"

const MODEL_FILENAME = /\.(glb|gltf)$/i

export function getModelsDirectory() {
  return path.join(process.cwd(), "3Dmodels")
}

export async function listAvailableModels() {
  try {
    const files = await readdir(getModelsDirectory())
    return files.filter((file) => MODEL_FILENAME.test(file)).sort()
  } catch {
    return []
  }
}
