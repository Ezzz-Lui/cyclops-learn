import { useTranslations } from "next-intl"

import { LandingCta } from "@/components/marketing/landing-cta"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  const t = useTranslations("Marketing")

  return (
    <section className="relative flex min-h-[min(100svh,54rem)] items-center px-6 py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center space-y-8 text-center">
        <Badge
          variant="secondary"
          className="border border-primary/30 bg-primary/15 text-foreground"
        >
          {t("badge")}
        </Badge>
        <div className="space-y-5">
          <h1 className="font-heading text-5xl font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {t("heroTitleBefore")}{" "}
            <span className="underline decoration-primary decoration-8 underline-offset-8">
              {t("heroTitleAccent")}
            </span>
          </h1>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("heroBody")}
          </p>
        </div>
        <LandingCta />
      </div>
    </section>
  )
}
