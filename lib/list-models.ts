import { readdir } from "node:fs/promises"
import path from "node:path"

const MODEL_BASENAME = /^[\w.\-]+\.(glb|gltf)$/i

export function getModelsDirectory() {
  return path.join(process.cwd(), "3Dmodels")
}

async function walkModelFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkModelFiles(full)))
      continue
    }
    if (MODEL_BASENAME.test(entry.name)) {
      files.push(full)
    }
  }

  return files
}

export async function listAvailableModels() {
  try {
    const files = await walkModelFiles(getModelsDirectory())
    return [...new Set(files.map((file) => path.basename(file)))].sort()
  } catch {
    return []
  }
}

export async function resolveModelAbsolutePath(filename: string) {
  if (!MODEL_BASENAME.test(filename)) {
    return null
  }

  const root = path.resolve(getModelsDirectory())
  let files: string[]
  try {
    files = await walkModelFiles(root)
  } catch {
    return null
  }

  const match = files.find((file) => path.basename(file) === filename)
  if (!match) {
    return null
  }

  if (!match.startsWith(root + path.sep)) {
    return null
  }

  return match
}
