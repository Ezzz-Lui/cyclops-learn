import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import { Readable } from "node:stream"

import { resolveModelAbsolutePath } from "@/lib/list-models"

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
  const filePath = await resolveModelAbsolutePath(filename)

  if (!filePath) {
    return new Response("Model not found", { status: 404 })
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
