import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"

import { AuthControls } from "@/components/auth/auth-controls"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { Link } from "@/i18n/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await auth.protect()
  const t = await getTranslations()

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/home" className="text-sm font-medium">
            {t("Brand.name")}
          </Link>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/home" className="hover:text-foreground">
              {t("Nav.home")}
            </Link>
            <Link href="/canvas" className="hover:text-foreground">
              {t("Nav.canvas")}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <AuthControls />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
