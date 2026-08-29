import type { Metadata } from "next"
import Link from "next/link"

import { PlaceholderFrame } from "@/components/placeholders/placeholder-frame"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Canvas",
}

export default function CanvasIndexPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="font-heading text-2xl font-medium">Canvas</h1>
      <p className="text-sm text-muted-foreground">
        Pick a project from home, or open a seeded placeholder.
      </p>
      <PlaceholderFrame label="No project selected">
        <div className="flex flex-wrap gap-2">
          <Link href="/canvas/living-room" className={buttonVariants()}>
            Sala
          </Link>
          <Link
            href="/canvas/bamboo"
            className={buttonVariants({ variant: "outline" })}
          >
            Bambú
          </Link>
          <Link
            href="/canvas/motherboard"
            className={buttonVariants({ variant: "outline" })}
          >
            Placa base
          </Link>
          <Link
            href="/canvas/server"
            className={buttonVariants({ variant: "outline" })}
          >
            Servidor
          </Link>
          <Link
            href="/home"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to home
          </Link>
        </div>
      </PlaceholderFrame>
    </main>
  )
}
