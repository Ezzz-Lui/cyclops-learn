import { Suspense } from "react"
import { notFound } from "next/navigation"

import { HarnessClient } from "./harness-client"

export default function ThreeDHarnessPage() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_3D_HARNESS !== "1"
  ) {
    notFound()
  }

  return (
    <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">Loading 3D harness…</p>}>
      <HarnessClient />
    </Suspense>
  )
}
