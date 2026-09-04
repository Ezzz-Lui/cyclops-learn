import { SignUp } from "@clerk/nextjs"
import { getLocale, getTranslations } from "next-intl/server"

import { getPathname } from "@/i18n/navigation"

export async function generateMetadata() {
  const t = await getTranslations("Auth")
  return { title: t("signUpTitle") }
}

export default async function SignUpPage() {
  const locale = await getLocale()
  const path = getPathname({ locale, href: "/sign-up" })
  const signInUrl = getPathname({ locale, href: "/sign-in" })
  const homeUrl = getPathname({ locale, href: "/home" })

  return (
    <SignUp
      path={path}
      routing="path"
      signInUrl={signInUrl}
      forceRedirectUrl={homeUrl}
      fallbackRedirectUrl={homeUrl}
    />
  )
}
