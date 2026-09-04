import { SignIn } from "@clerk/nextjs"
import { getLocale, getTranslations } from "next-intl/server"

import { getPathname } from "@/i18n/navigation"

export async function generateMetadata() {
  const t = await getTranslations("Auth")
  return { title: t("signInTitle") }
}

export default async function SignInPage() {
  const locale = await getLocale()
  const path = getPathname({ locale, href: "/sign-in" })
  const signUpUrl = getPathname({ locale, href: "/sign-up" })
  const homeUrl = getPathname({ locale, href: "/home" })

  return (
    <SignIn
      path={path}
      routing="path"
      signUpUrl={signUpUrl}
      forceRedirectUrl={homeUrl}
      fallbackRedirectUrl={homeUrl}
    />
  )
}
