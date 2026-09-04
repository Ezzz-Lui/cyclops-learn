import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"

export default async function NotFound() {
  const t = await getTranslations("NotFound")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="font-heading text-2xl font-medium">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("body")}</p>
      <Link href="/" className="mt-4 text-sm underline">
        Cyclops
      </Link>
    </main>
  )
}
