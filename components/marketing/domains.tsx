import { HugeiconsIcon } from "@hugeicons/react"
import {
  Building03Icon,
  Car01Icon,
  CpuIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"

const domains = [
  {
    title: "Computing",
    topic: "computing",
    blurb: "Machines, boards, and the stack that runs them.",
    icon: CpuIcon,
  },
  {
    title: "Architecture",
    topic: "architecture",
    blurb: "Spaces, structure, and how a building holds.",
    icon: Building03Icon,
  },
  {
    title: "Mechanics",
    topic: "mechanics",
    blurb: "Moving assemblies and the forces they take.",
    icon: Car01Icon,
  },
]

export function DomainsSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
            Same bench
          </p>
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            Domains
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <article
              key={domain.topic}
              className="group rounded-3xl border border-border/80 bg-card/70 p-6 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_-24px_oklch(0.841_0.238_128.85/0.55)]"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-foreground">
                <HugeiconsIcon icon={domain.icon} strokeWidth={1.8} className="size-5" />
              </span>
              <h3 className="mt-6 font-heading text-xl font-medium">
                {domain.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {domain.blurb}
              </p>
              <Badge variant="secondary" className="mt-5">
                {domain.topic}
              </Badge>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
