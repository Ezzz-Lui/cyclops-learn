import type { Metadata } from "next"
import Link from "next/link"

import { PlaceholderFrame } from "@/components/placeholders/placeholder-frame"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Cyclops AI",
  description: "Learn complex objects by peeling layers and asking a contextual AI agent.",
}

export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="space-y-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Landing placeholder
        </p>
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          Learning by Shipping
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Marketing page comes later. This route stays at <code>/</code> so the
          public entry stays separate from home and canvas.
        </p>
      </div>

      <PlaceholderFrame label="Hero / value proposition">
        <p className="text-sm text-muted-foreground">
          Explore buildings, machines, and computers layer by layer.
        </p>
      </PlaceholderFrame>

      <div className="flex flex-wrap gap-2">
        <Link href="/home" className={buttonVariants()}>
          Open app home
        </Link>
        <Link href="/sign-up" className={buttonVariants({ variant: "outline" })}>
          Create an account
        </Link>
      </div>
    </main>
  )
}
