import { useTranslations } from "next-intl"

import { Reveal } from "@/components/marketing/reveal"

const stepKeys = ["object", "layers", "components"] as const

export function PatternSection() {
  const t = useTranslations("Marketing")

  return (
    <section className="relative px-6 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="max-w-2xl space-y-3">
          <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
            {t("patternKicker")}
          </p>
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {t("patternTitle")}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            {t("patternSubtitle")}
          </p>
        </Reveal>

        {/* Alternating timeline with oversized ghost numbers (spec: The Ascent). */}
        <ol className="relative mt-16 space-y-16 md:space-y-24">
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent md:left-1/2"
          />
          {stepKeys.map((key, index) => {
            const number = String(index + 1).padStart(2, "0")
            const flip = index % 2 === 1
            return (
              <li key={key} className="relative md:grid md:grid-cols-2 md:gap-16">
                {/* Timeline node on the spine. */}
                <span
                  aria-hidden
                  className="absolute top-2 left-4 flex size-3 -translate-x-1/2 items-center justify-center rounded-full border border-primary/60 bg-neutral-950 md:left-1/2"
                >
                  <span className="size-1 rounded-full bg-primary" />
                </span>
                <Reveal
                  delay={`${index * 90}ms`}
                  className={
                    flip
                      ? "relative pl-12 md:col-start-2 md:pl-16"
                      : "relative pl-12 md:pr-16 md:pl-0 md:text-right"
                  }
                >
                  <span
                    aria-hidden
                    className={
                      "pointer-events-none absolute -top-14 font-heading text-[8rem] leading-none font-bold text-white/5 select-none sm:text-[10rem] " +
                      (flip ? "right-0 md:-left-6" : "right-0 md:-right-6")
                    }
                  >
                    {number}
                  </span>
                  <p className="relative font-mono text-sm text-primary">
                    {number}
                  </p>
                  <h3 className="relative mt-3 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
                    {t(`patternSteps.${key}.title`)}
                  </h3>
                  <p
                    className={
                      "relative mt-3 max-w-md text-sm leading-relaxed text-neutral-400 sm:text-base " +
                      (flip ? "" : "md:ml-auto")
                    }
                  >
                    {t(`patternSteps.${key}.body`)}
                  </p>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
