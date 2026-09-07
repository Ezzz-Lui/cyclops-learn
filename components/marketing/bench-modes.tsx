import { Fragment } from "react"
import { useTranslations } from "next-intl"

import { Reveal } from "@/components/marketing/reveal"
import { cn } from "@/lib/utils"

const modes = [
  { key: "explore", live: true },
  { key: "faults", live: false },
  { key: "diagnosis", live: false },
] as const

const barDelays = ["0s", "0.2s", "0.35s", "0.5s"] as const

function Equalizer({ live }: { live: boolean }) {
  return (
    <div aria-hidden className="flex h-8 items-end gap-1">
      {barDelays.map((delay, index) => (
        <span
          key={index}
          className={cn(
            "w-1 rounded-full",
            live
              ? "animate-equalizer h-full origin-bottom bg-primary"
              : "origin-bottom bg-white/15"
          )}
          style={
            live
              ? { animationDelay: delay }
              : { height: `${30 + index * 14}%` }
          }
        />
      ))}
    </div>
  )
}

export function BenchModesSection() {
  const t = useTranslations("Marketing")

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <Reveal className="max-w-2xl space-y-3">
          <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
            {t("modesKicker")}
          </p>
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {t("modesTitle")}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            {t("modesNote")}
          </p>
        </Reveal>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {modes.map((mode, index) => (
            <Fragment key={mode.key}>
              {mode.key === "faults" ? (
                <p className="py-5 font-mono text-[11px] tracking-[0.2em] text-neutral-500 uppercase">
                  {t("modesPathKicker")}
                </p>
              ) : null}
              <Reveal delay={`${index * 100}ms`}>
                <article
                  className={cn(
                    "group grid items-center gap-5 py-8 transition-colors duration-300 sm:grid-cols-[auto_1fr_auto] sm:gap-8",
                    mode.live ? "hover:bg-white/[0.02]" : "opacity-70"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <Equalizer live={mode.live} />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "font-heading text-2xl font-medium tracking-tight",
                        mode.live && "transition-colors group-hover:text-glow"
                      )}
                    >
                      {t(`modes.${mode.key}.title`)}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
                      {t(`modes.${mode.key}.body`)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "justify-self-start rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase sm:justify-self-end",
                      mode.live
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 text-neutral-500"
                    )}
                  >
                    {t(`modes.${mode.key}.status`)}
                  </span>
                </article>
              </Reveal>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
