"use client"

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { useLocale, useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { getPathname } from "@/i18n/navigation"

export function AuthControls() {
  const t = useTranslations("Auth")
  const locale = useLocale()
  const homeUrl = getPathname({ locale, href: "/home" })

  return (
    <nav className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="redirect" forceRedirectUrl={homeUrl}>
          <button type="button" className={buttonVariants({ variant: "ghost" })}>
            {t("signIn")}
          </button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl={homeUrl}>
          <button type="button" className={buttonVariants()}>
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
