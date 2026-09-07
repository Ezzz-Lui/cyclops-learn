"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Building03Icon,
  Car01Icon,
  CpuIcon,
} from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

import { Reveal } from "@/components/marketing/reveal"
import { cn } from "@/lib/utils"

const domains = [
  { key: "computing", icon: CpuIcon },
  { key: "architecture", icon: Building03Icon },
  { key: "mechanics", icon: Car01Icon },
] as const

type DomainKey = (typeof domains)[number]["key"]
type Filter = "all" | DomainKey

function DomainFigure() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="size-full">
      {/* Hexagon wireframe (spec vector shape). */}
      <path
        d="M50 5 L89 27.5 V72.5 L50 95 L11 72.5 V27.5 Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M50 22 L74 36 V64 L50 78 L26 64 V36 Z"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.6"
      />
      <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.8" />
      <path d="M50 5 V22 M89 27.5 L74 36 M11 72.5 L26 64" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
    </svg>
  )
}

export function DomainsSection() {
  const t = useTranslations("Marketing")
  const tTopics = useTranslations("Topics")
  const [filter, setFilter] = useState<Filter>("all")

  const filters: Filter[] = ["all", "computing", "architecture", "mechanics"]

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
              {t("domainsKicker")}
            </p>
            <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
              {t("domainsTitle")}
            </h2>
          </div>

          {/* Segmented control (spec: projects grid filter). */}
          <div
            role="tablist"
            className="flex max-w-full flex-nowrap gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filters.map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-300",
                  filter === value
                    ? "bg-primary text-neutral-950"
                    : "text-neutral-400 hover:text-neutral-100"
                )}
              >
                {value === "all" ? t("domainsFilterAll") : tTopics(value)}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Layout shift: the selected domain expands to the full row. */}
        <div className="grid gap-5 md:grid-cols-12">
          {domains.map((domain, index) => {
            const active = filter === "all" || filter === domain.key
            const expanded = filter === domain.key
            return (
              <Reveal
                key={domain.key}
                delay={`${index * 100}ms`}
                className={cn(
                  "transition-all duration-500",
                  expanded ? "md:col-span-12" : "md:col-span-4",
                  !active && "hidden scale-95 opacity-0"
                )}
              >
                <article
                  className={cn(
                    "group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-primary/40",
                    expanded && "md:flex md:items-center md:gap-12 md:p-10"
                  )}
                >
                  {/* Grayscale figure, colors up and scales on hover (spec media behavior). */}
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -top-8 -right-8 size-40 text-neutral-700 transition-all duration-500 group-hover:scale-105 group-hover:text-primary/60",
                      expanded &&
                        "md:static md:size-44 md:shrink-0 md:text-neutral-600"
                    )}
                  >
                    <DomainFigure />
                  </div>
                  <div className="relative">
                    <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-neutral-950/70 text-primary">
                      <HugeiconsIcon
                        icon={domain.icon}
                        strokeWidth={1.8}
                        className="size-5"
                      />
                    </span>
                    <h3 className="mt-6 font-heading text-xl font-medium">
                      {t(`domains.${domain.key}.title`)}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 text-sm leading-relaxed text-neutral-400",
                        expanded && "md:max-w-2xl md:text-base"
                      )}
                    >
                      {t(`domains.${domain.key}.blurb`)}
                    </p>
                    <span className="mt-5 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-neutral-300 uppercase">
                      {t(`domains.${domain.key}.example`)}
                    </span>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
