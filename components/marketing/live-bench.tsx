import { HugeiconsIcon } from "@hugeicons/react"
import {
  InformationCircleIcon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Reveal } from "@/components/marketing/reveal"

const features = [
  { key: "viewer", icon: Search01Icon },
  { key: "agent", icon: InformationCircleIcon },
  { key: "practice", icon: Tick02Icon },
] as const

export function LiveBenchSection() {
  const t = useTranslations("Marketing")

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <Reveal className="max-w-2xl space-y-3">
          <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
            {t("liveKicker")}
          </p>
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {t("liveTitle")}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            {t("liveSubtitle")}
          </p>
        </Reveal>

        {/* 3D perspective cards (spec: Core Systems). */}
        <ul className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <li key={feature.key} className="group h-full [perspective:1200px]">
              <Reveal className="h-full" delay={`${index * 110}ms`}>
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-500 [transform-style:preserve-3d] group-hover:border-primary/30 group-hover:[transform:rotateX(6deg)_rotateY(-6deg)]">
                  {/* Scanning shimmer on hover. */}
                  <div
                    aria-hidden
                    className="animate-shimmer-effect pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  {/* Rotating ring + pulsing data point. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-10 -right-10 size-36 opacity-60"
                  >
                    <svg viewBox="0 0 100 100" fill="none" className="size-full">
                      <g className="animate-orbit-slow origin-center">
                        <ellipse
                          cx="50"
                          cy="50"
                          rx="40"
                          ry="14"
                          stroke="currentColor"
                          strokeWidth="0.5"
                          className="text-white/20"
                        />
                        <ellipse
                          cx="50"
                          cy="50"
                          rx="40"
                          ry="14"
                          stroke="currentColor"
                          strokeWidth="0.5"
                          className="text-primary/30"
                          transform="rotate(60 50 50)"
                        />
                      </g>
                    </svg>
                    <span className="absolute top-1/2 left-1/2 flex size-2 -translate-x-1/2 -translate-y-1/2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
                      <span className="relative inline-flex size-2 rounded-full bg-primary/80" />
                    </span>
                  </div>

                  <span className="relative flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-neutral-950/70 text-primary">
                    <HugeiconsIcon
                      icon={feature.icon}
                      strokeWidth={1.8}
                      className="size-5"
                    />
                  </span>
                  <h3 className="relative mt-6 font-heading text-xl font-medium">
                    {t(`live.${feature.key}.title`)}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-neutral-400">
                    {t(`live.${feature.key}.body`)}
                  </p>

                  {/* Internal progress line: -100% -> 0 on hover. */}
                  <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
                    <div className="h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-primary to-primary/40 transition-transform duration-700 ease-out group-hover:translate-x-0" />
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
