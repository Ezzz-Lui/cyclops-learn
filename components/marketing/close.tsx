import { useTranslations } from "next-intl"

import { LandingCta } from "@/components/marketing/landing-cta"
import { Reveal } from "@/components/marketing/reveal"

export function CloseSection() {
  const t = useTranslations("Marketing")

  return (
    <section className="px-6 pb-28">
      <Reveal>
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-primary/25 bg-gradient-to-br from-primary/15 via-neutral-950 to-neutral-950 px-8 py-16 sm:px-12 sm:py-20">
          {/* Shimmer sweep. */}
          <div
            aria-hidden
            className="animate-shimmer-effect pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
          />
          {/* Corner glow. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl"
          />
          <p className="relative font-mono text-xs tracking-[0.22em] text-primary uppercase">
            {t("closeKicker")}
          </p>
          <h2 className="relative mt-4 max-w-xl font-heading text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            <span className="text-glow">{t("closeTitle")}</span>
          </h2>
          <p className="relative mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
            {t("closeBody")}
          </p>
          <div className="relative mt-8">
            <LandingCta />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
