import { HugeiconsIcon } from "@hugeicons/react"
import {
  MicroscopeIcon,
  Search01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

const modes = [
  { key: "explore", icon: Search01Icon, featured: true },
  { key: "faults", icon: Wrench01Icon, featured: false },
  { key: "diagnosis", icon: MicroscopeIcon, featured: false },
] as const

export function BenchModesSection() {
  const t = useTranslations("Marketing")

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
            {t("modesKicker")}
          </p>
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {t("modesTitle")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {modes.map((mode) => (
            <article
              key={mode.key}
              className={
                mode.featured
                  ? "rounded-3xl border border-primary/30 bg-primary/12 p-8 md:row-span-2 md:min-h-72"
                  : "rounded-3xl border border-border/80 bg-card/70 p-8"
              }
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-background/80 ring-1 ring-foreground/10">
                <HugeiconsIcon icon={mode.icon} strokeWidth={1.8} className="size-5" />
              </span>
              <h3 className="mt-6 font-heading text-2xl font-medium tracking-tight">
                {t(`modes.${mode.key}.title`)}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {t(`modes.${mode.key}.body`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
