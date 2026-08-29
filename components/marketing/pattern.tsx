const steps = [
  { title: "Object", body: "Load a system onto the bench." },
  { title: "Layers", body: "Peel structure until the working parts show." },
  { title: "Components", body: "Ask in context about the piece in front of you." },
]

export function PatternSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
            The pattern
          </p>
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            Object → layers → components
          </h2>
        </div>
        <ol className="relative grid gap-6 md:grid-cols-3">
          <div
            aria-hidden
            className="absolute top-7 right-[16%] left-[16%] hidden h-px bg-border md:block"
          />
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-3xl border border-border/80 bg-card/60 p-6 shadow-sm backdrop-blur-sm"
            >
              <p className="font-mono text-sm text-primary">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-heading text-xl font-medium">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
