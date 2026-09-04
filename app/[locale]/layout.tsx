import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import { hasLocale } from "next-intl"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { Figtree, Geist_Mono, Noto_Sans_SC } from "next/font/google"
import { notFound } from "next/navigation"

import { ConvexClientProvider } from "@/components/providers/convex-client-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { clerkLocalizations } from "@/i18n/clerk"
import { htmlLang, isAppLocale } from "@/i18n/config"
import { getPathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-cjk",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isAppLocale(locale)) {
    return {}
  }
  const t = await getTranslations({ locale, namespace: "Metadata" })
  return {
    title: {
      default: t("title"),
      template: `%s · ${t("title")}`,
    },
    description: t("description"),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale) || !isAppLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()
  const signInUrl = getPathname({ locale, href: "/sign-in" })
  const signUpUrl = getPathname({ locale, href: "/sign-up" })
  const homeUrl = getPathname({ locale, href: "/home" })

  return (
    <html
      lang={htmlLang[locale]}
      suppressHydrationWarning
      className={cn(
        "antialiased font-sans",
        fontMono.variable,
        figtree.variable,
        notoSansSC.variable,
        locale === "zh" && "[--font-sans:var(--font-cjk)]"
      )}
    >
      <body>
        <ClerkProvider
          appearance={{ theme: shadcn }}
          localization={clerkLocalizations[locale]}
          signInUrl={signInUrl}
          signUpUrl={signUpUrl}
          signInFallbackRedirectUrl={homeUrl}
          signUpFallbackRedirectUrl={homeUrl}
          afterSignOutUrl={getPathname({ locale, href: "/" })}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ConvexClientProvider>
              <ThemeProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </ThemeProvider>
            </ConvexClientProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
