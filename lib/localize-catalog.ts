import type { AppLocale } from "@/i18n/config"
import type { PartCatalog, PartCatalogEntry } from "@/lib/part-catalog"

export function localizedLabel(part: PartCatalogEntry, locale: AppLocale) {
  if (locale === "en") {
    return part.labelEn
  }
  if (locale === "zh") {
    return part.labelZh ?? part.labelEn
  }
  return part.label
}

export function localizedSummary(part: PartCatalogEntry, locale: AppLocale) {
  if (locale === "en") {
    return part.summaryEn ?? part.summary
  }
  if (locale === "zh") {
    return part.summaryZh ?? part.summary
  }
  return part.summary
}

export function localizePart(
  part: PartCatalogEntry,
  locale: AppLocale
): PartCatalogEntry {
  return {
    ...part,
    label: localizedLabel(part, locale),
    summary: localizedSummary(part, locale),
  }
}

export function localizeCatalog(
  catalog: PartCatalog,
  locale: AppLocale
): PartCatalog {
  const title =
    locale === "en"
      ? (catalog.titleEn ?? catalog.title)
      : locale === "zh"
        ? (catalog.titleZh ?? catalog.titleEn ?? catalog.title)
        : catalog.title
  const overview =
    locale === "en"
      ? (catalog.overviewEn ?? catalog.overview)
      : locale === "zh"
        ? (catalog.overviewZh ?? catalog.overview)
        : catalog.overview

  return {
    ...catalog,
    title,
    overview,
    parts: catalog.parts.map((part) => localizePart(part, locale)),
  }
}

export function getLocalizedCatalog(
  catalog: PartCatalog | null,
  locale: string
) {
  if (!catalog) {
    return null
  }
  if (locale === "en" || locale === "zh") {
    return localizeCatalog(catalog, locale)
  }
  return localizeCatalog(catalog, "es")
}
