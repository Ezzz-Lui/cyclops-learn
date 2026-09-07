import { useTranslations } from "next-intl"

import { Reveal } from "@/components/marketing/reveal"

export function ProblemSection() {
  const t = useTranslations("Marketing")

  return (
    <section className="relative -mt-8 px-6 pt-4 pb-16 md:-mt-16 md:pt-12 md:pb-28">
      <Reveal>
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-10 backdrop-blur-sm sm:rounded-[2rem] sm:px-12 sm:py-14">
          {/* Oversized ghost label (spec: big background type at 5% white). */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-3 right-2 font-heading text-[5.5rem] leading-none font-bold text-white/5 select-none sm:-top-6 sm:right-4 sm:text-[12rem]"
          >
            2D
          </span>
          <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
            {t("problemKicker")}
          </p>
          <h2 className="mt-4 max-w-xl font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {t("problemTitle")}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            {t("problemBody")}
          </p>
        </div>
      </Reveal>
    </section>
  )
}
