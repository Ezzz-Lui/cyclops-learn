"use client"

import { useLocale, useTranslations } from "next-intl"

import { isAppLocale, localeNames } from "@/i18n/config"
import { routing } from "@/i18n/routing"
import { usePathname, useRouter } from "@/i18n/navigation"

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitch")
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        onChange={(event) => {
          const next = event.target.value
          if (!isAppLocale(next)) {
            return
          }
          router.replace(pathname, { locale: next })
        }}
        className="h-8 rounded-md border border-border/80 bg-background px-2 text-xs text-foreground"
      >
        {routing.locales.map((code) => (
          <option key={code} value={code}>
            {localeNames[code]}
          </option>
        ))}
      </select>
    </label>
  )
}
