import { useTranslations } from "next-intl"

import { LandingCta } from "@/components/marketing/landing-cta"

export function CloseSection() {
  const t = useTranslations("Marketing")

  return (
    <section className="px-6 pb-24">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-primary/25 bg-primary/14 px-8 py-16 sm:px-12 sm:py-20">
        <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
          {t("closeKicker")}
        </p>
        <h2 className="mt-4 max-w-xl font-heading text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          {t("closeTitle")}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          {t("closeBody")}
        </p>
        <div className="mt-8">
          <LandingCta />
        </div>
      </div>
    </section>
  )
}
