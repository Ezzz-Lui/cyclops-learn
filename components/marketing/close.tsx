import { LandingCta } from "@/components/marketing/landing-cta"

export function CloseSection() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-primary/25 bg-primary/14 px-8 py-16 sm:px-12 sm:py-20">
        <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
          Ready
        </p>
        <h2 className="mt-4 max-w-xl font-heading text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          The bench is open.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Bring a system to the lab. Peel it, test a claim, and diagnose with
          the agent in context.
        </p>
        <div className="mt-8">
          <LandingCta />
        </div>
      </div>
    </section>
  )
}
