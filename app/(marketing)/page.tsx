import type { Metadata } from "next"

import { BenchModesSection } from "@/components/marketing/bench-modes"
import { CloseSection } from "@/components/marketing/close"
import { DomainsSection } from "@/components/marketing/domains"
import { HeroSection } from "@/components/marketing/hero"
import { PatternSection } from "@/components/marketing/pattern"

export const metadata: Metadata = {
  title: "Cyclops",
  description:
    "A systems lab for peeling objects layer by layer and asking a contextual agent on the bench.",
}

export default function LandingPage() {
  return (
    <main className="relative isolate flex flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_18%,transparent_62%)]" />
        <div className="absolute top-[-12%] right-[-8%] size-[34rem] rounded-full bg-primary/30 blur-3xl dark:bg-primary/18" />
        <div className="absolute bottom-[8%] left-[-12%] size-[26rem] rounded-full bg-primary/12 blur-3xl" />
      </div>
      <HeroSection />
      <PatternSection />
      <BenchModesSection />
      <DomainsSection />
      <CloseSection />
    </main>
  )
}
