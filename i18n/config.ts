export const locales = ["es", "en", "zh"] as const

export type AppLocale = (typeof locales)[number]

export const defaultLocale: AppLocale = "es"

export const localeNames: Record<AppLocale, string> = {
  es: "Español",
  en: "English",
  zh: "中文",
}

export const htmlLang: Record<AppLocale, string> = {
  es: "es",
  en: "en",
  zh: "zh-CN",
}

export function isAppLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale)
}
