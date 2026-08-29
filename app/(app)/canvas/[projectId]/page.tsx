import type { Metadata } from "next"
import Link from "next/link"

import { CanvasWorkspace } from "@/components/canvas/canvas-workspace"
import { buttonVariants } from "@/components/ui/button"
import { listAvailableModels } from "@/lib/list-models"
import { getModelSrc, resolveProjectModelFile } from "@/lib/model-catalog"

export const metadata: Metadata = {
  title: "Canvas",
}

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const availableModels = await listAvailableModels()
  const modelFile = resolveProjectModelFile(projectId, availableModels)

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-medium">Canvas</h1>
          <p className="text-sm text-muted-foreground">
            Project <code>{projectId}</code> · explore the ICE and ask the agent
          </p>
        </div>
        <Link href="/home" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Back to home
        </Link>
      </div>

      <CanvasWorkspace
        projectSlug={projectId}
        modelSrc={getModelSrc(modelFile)}
        modelFile={modelFile}
      />
    </main>
  )
}
