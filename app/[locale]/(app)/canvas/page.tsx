import { getLocale, getTranslations } from "next-intl/server"

import { PlaceholderFrame } from "@/components/placeholders/placeholder-frame"
import { buttonVariants } from "@/components/ui/button"
import { isAppLocale } from "@/i18n/config"
import { Link } from "@/i18n/navigation"
import { listLocalizedProjects } from "@/lib/localized-projects"

export async function generateMetadata() {
  const t = await getTranslations("Canvas")
  return { title: t("title") }
}

export default async function CanvasIndexPage() {
  const t = await getTranslations("Canvas")
  const locale = await getLocale()
  const projects = listLocalizedProjects(isAppLocale(locale) ? locale : "es")

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="font-heading text-2xl font-medium">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("indexBody")}</p>
      <PlaceholderFrame label={t("noProject")}>
        <div className="flex flex-wrap gap-2">
          {projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/canvas/${project.id}`}
              className={buttonVariants({
                variant: index === 0 ? "default" : "outline",
              })}
            >
              {project.title}
            </Link>
          ))}
          <Link href="/home" className={buttonVariants({ variant: "outline" })}>
            {t("backHome")}
          </Link>
        </div>
      </PlaceholderFrame>
    </main>
  )
}
