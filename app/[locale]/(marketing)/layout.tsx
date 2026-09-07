import { getTranslations } from "next-intl/server"

import { AuthControls } from "@/components/auth/auth-controls"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { Link } from "@/i18n/navigation"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [tBrand, tMarketing] = await Promise.all([
    getTranslations("Brand"),
    getTranslations("Marketing"),
  ])

  return (
    // Forced dark scope: the landing keeps its cinematic look in any theme.
    <div className="dark flex min-h-svh flex-col bg-black text-neutral-50 selection:bg-white/20">
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-full border border-white/10 bg-neutral-950/70 py-2 pr-2 pl-5 shadow-[0_8px_32px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-heading text-sm font-medium tracking-tight"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            {tBrand("name")}
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] text-primary uppercase sm:inline">
              {tMarketing("versionBadge")}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <AuthControls />
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
