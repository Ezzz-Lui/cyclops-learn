import { getLocale, getTranslations } from "next-intl/server"

import { PlaceholderFrame } from "@/components/placeholders/placeholder-frame"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { isAppLocale } from "@/i18n/config"
import {
  listLocalizedProjects,
  topicOrder,
  type LocalizedProject,
  type Topic,
} from "@/lib/localized-projects"

export async function generateMetadata() {
  const t = await getTranslations("Home")
  return { title: t("title") }
}

function ProjectLink({
  project,
  openLabel,
  topicLabel,
}: {
  project: LocalizedProject
  openLabel: string
  topicLabel: string
}) {
  return (
    <Link href={`/canvas/${project.id}`} className="block">
      <Card size="sm" className="transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
          <CardDescription>{openLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">{topicLabel}</Badge>
        </CardContent>
      </Card>
    </Link>
  )
}

export default async function HomePage() {
  const t = await getTranslations()
  const locale = await getLocale()
  const projects = listLocalizedProjects(isAppLocale(locale) ? locale : "es")
  const recentByTopic = topicOrder.reduce(
    (acc, topic) => {
      acc[topic] = projects.filter((project) => project.topic === topic)
      return acc
    },
    {} as Record<Topic, LocalizedProject[]>
  )

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8">
      <div>
        <h1 className="font-heading text-2xl font-medium">{t("Home.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("Home.subtitle")}</p>
      </div>

      <PlaceholderFrame label={t("Home.recentByTopic")}>
        <div className="grid gap-6 md:grid-cols-3">
          {topicOrder.map((topic) => (
            <div key={topic} className="space-y-3">
              <h2 className="text-sm font-medium">{t(`Topics.${topic}`)}</h2>
              <div className="space-y-2">
                {recentByTopic[topic].map((project) => (
                  <ProjectLink
                    key={project.id}
                    project={project}
                    openLabel={t("Home.openCanvas")}
                    topicLabel={t(`Topics.${project.topic}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </PlaceholderFrame>

      <PlaceholderFrame label={t("Home.newlyAdded")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectLink
              key={project.id}
              project={project}
              openLabel={t("Home.openCanvas")}
              topicLabel={t(`Topics.${project.topic}`)}
            />
          ))}
        </div>
      </PlaceholderFrame>
    </main>
  )
}
