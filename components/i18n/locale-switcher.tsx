"use client"

import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isAppLocale } from "@/i18n/config"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("LocaleSwitch")
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const fullLabel = isAppLocale(locale) ? t(locale) : t("label")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("label")}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-1",
          compact && "px-2"
        )}
      >
        {compact ? (
          <>
            <span className="font-mono text-[11px] tracking-[0.12em] uppercase sm:hidden">
              {locale}
            </span>
            <span className="hidden sm:inline">{fullLabel}</span>
          </>
        ) : (
          fullLabel
        )}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className="size-3.5 opacity-70"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36 w-auto">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => {
            if (!isAppLocale(value) || value === locale) {
              return
            }
            router.replace(pathname, { locale: value })
          }}
        >
          {routing.locales.map((code) => (
            <DropdownMenuRadioItem key={code} value={code}>
              {t(code)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
