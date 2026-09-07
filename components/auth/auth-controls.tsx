"use client"

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { useLocale, useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { getPathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

export function AuthControls({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("Auth")
  const locale = useLocale()
  const homeUrl = getPathname({ locale, href: "/home" })
  const size = compact ? "sm" : "default"

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      <Show when="signed-out">
        <SignInButton mode="redirect" forceRedirectUrl={homeUrl}>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size }),
              compact && "hidden sm:inline-flex"
            )}
          >
            {t("signIn")}
          </button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl={homeUrl}>
          <button type="button" className={buttonVariants({ size })}>
            {t("signUp")}
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </Show>
    </nav>
  )
}
