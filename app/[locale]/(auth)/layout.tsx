import { getTranslations } from "next-intl/server"

import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { Link } from "@/i18n/navigation"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations("Brand")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/" className="text-sm font-medium">
          {t("name")}
        </Link>
        <LocaleSwitcher />
      </div>
      {children}
    </div>
  )
}
