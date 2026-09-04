import { getTranslations } from "next-intl/server"

import { AuthControls } from "@/components/auth/auth-controls"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { Link } from "@/i18n/navigation"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations("Brand")

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/75 px-6 py-4 backdrop-blur-md">
        <Link
          href="/"
          className="font-heading text-sm font-medium tracking-tight"
        >
          {t("name")}
          <span className="ml-2 inline-block size-1.5 rounded-full bg-primary align-middle" />
        </Link>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <AuthControls />
        </div>
      </header>
      {children}
    </div>
  )
}
