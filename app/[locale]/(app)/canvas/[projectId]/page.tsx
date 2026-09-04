import { getTranslations } from "next-intl/server"

import { CanvasWorkspace } from "@/components/canvas/canvas-workspace"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { listAvailableModels } from "@/lib/list-models"
import { getModelSrc, resolveProjectModelFile } from "@/lib/model-catalog"

export async function generateMetadata() {
  const t = await getTranslations("Canvas")
  return { title: t("title") }
}

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const t = await getTranslations("Canvas")
  const { projectId } = await params
  const availableModels = await listAvailableModels()
  const modelFile = resolveProjectModelFile(projectId, availableModels)

  return (
    <main className="flex h-full min-h-0 flex-col gap-4 overflow-hidden px-4 py-4 lg:px-6">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-medium">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("projectMeta", { id: projectId })}
          </p>
        </div>
        <Link href="/home" className={buttonVariants({ variant: "outline", size: "sm" })}>
          {t("backHome")}
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
