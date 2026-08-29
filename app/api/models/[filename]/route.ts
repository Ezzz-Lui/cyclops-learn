import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import path from "node:path"
import { Readable } from "node:stream"

import { getModelsDirectory } from "@/lib/list-models"

const MODEL_FILENAME = /^[\w.\-]+\.(glb|gltf)$/i

function contentTypeFor(filename: string) {
  return filename.toLowerCase().endsWith(".gltf")
    ? "model/gltf+json"
    : "model/gltf-binary"
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  if (!MODEL_FILENAME.test(filename)) {
    return new Response("Invalid model filename", { status: 400 })
  }

  const modelsDir = path.resolve(getModelsDirectory())
  const filePath = path.resolve(modelsDir, filename)

  if (!filePath.startsWith(modelsDir + path.sep)) {
    return new Response("Invalid model filename", { status: 400 })
  }

  try {
    const info = await stat(filePath)
    if (!info.isFile()) {
      return new Response("Model not found", { status: 404 })
    }

    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream

    return new Response(stream, {
      headers: {
        "Content-Type": contentTypeFor(filename),
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch {
    return new Response("Model not found", { status: 404 })
  }
}
