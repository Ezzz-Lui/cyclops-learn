import type { AppLocale } from "@/i18n/config"
import { getLocalizedCatalog } from "@/lib/localize-catalog"
import { listPartCatalogs } from "@/lib/part-catalog"

export type Topic = "architecture" | "mechanics" | "computing"

export type LocalizedProject = {
  id: string
  title: string
  topic: Topic
}

export const topicOrder: Topic[] = ["computing", "architecture", "mechanics"]

export function listLocalizedProjects(locale: AppLocale): LocalizedProject[] {
  return listPartCatalogs().map((catalog) => {
    const localized = getLocalizedCatalog(catalog, locale)
    return {
      id: catalog.slug,
      title: localized?.title ?? catalog.title,
      topic: catalog.domain as Topic,
    }
  })
}
