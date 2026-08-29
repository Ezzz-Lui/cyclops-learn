"use client"

import { Show } from "@clerk/nextjs"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ctaClass = cn(
  buttonVariants({ size: "lg" }),
  "h-12 px-7 text-base shadow-[0_16px_40px_-16px_oklch(0.841_0.238_128.85/0.7)]"
)

export function LandingCta() {
  return (
    <div className="flex flex-wrap gap-3">
      <Show when="signed-out">
        <Link href="/sign-up" className={ctaClass}>
          Enter the lab
        </Link>
      </Show>
      <Show when="signed-in">
        <Link href="/home" className={ctaClass}>
          Go to bench
        </Link>
      </Show>
    </div>
  )
}
