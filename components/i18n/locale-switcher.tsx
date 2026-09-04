"use client"

import { useLocale, useTranslations } from "next-intl"

import { localeNames } from "@/i18n/config"
import { Link, usePathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitch")
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1 text-xs">
      {routing.locales.map((code) => (
        <Link
          key={code}
          href={pathname}
          locale={code}
          hrefLang={code}
          className={cn(
            "rounded-md px-2 py-1 transition-colors",
            code === locale
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {localeNames[code]}
        </Link>
      ))}
    </nav>
  )
}
