import { getTranslations } from "next-intl/server"

import { BenchModesSection } from "@/components/marketing/bench-modes"
import { CloseSection } from "@/components/marketing/close"
import { DomainsSection } from "@/components/marketing/domains"
import { HeroSection } from "@/components/marketing/hero"
import { LiveBenchSection } from "@/components/marketing/live-bench"
import { PatternSection } from "@/components/marketing/pattern"
import { ProblemSection } from "@/components/marketing/problem"

export async function generateMetadata() {
  const t = await getTranslations("Metadata")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function LandingPage() {
  return (
    <main className="relative isolate flex flex-1 flex-col overflow-x-clip bg-black">
      {/* Fixed grain overlay above everything (spec: z-9999, pointer-safe). */}
      <div
        aria-hidden
        className="bg-grain pointer-events-none fixed inset-0 z-[9999] opacity-[0.05] mix-blend-overlay"
      />
      {/* Fixed vertical grid lines. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="mx-auto grid h-full w-full max-w-6xl grid-cols-2 border-x border-white/[0.04] md:grid-cols-4">
          <div className="border-r border-white/[0.04]" />
          <div className="hidden border-r border-white/[0.04] md:block" />
          <div className="hidden border-r border-white/[0.04] md:block" />
        </div>
      </div>
      <HeroSection />
      <ProblemSection />
      <PatternSection />
      <LiveBenchSection />
      <BenchModesSection />
      <DomainsSection />
      <CloseSection />
    </main>
  )
}
