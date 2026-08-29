import type { Metadata } from "next"
import Link from "next/link"

import { PlaceholderFrame } from "@/components/placeholders/placeholder-frame"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Canvas",
}

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-medium">Canvas</h1>
          <p className="text-sm text-muted-foreground">
            Project <code>{projectId}</code> · mode, viewer, chat
          </p>
        </div>
        <Link href="/home" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Back to home
        </Link>
      </div>

      <div className="grid min-h-[32rem] flex-1 gap-4 lg:grid-cols-[14rem_minmax(0,1fr)_20rem]">
        <PlaceholderFrame label="Options / layers / mode">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Use case mode (explore / faults / diagnosis)</li>
            <li>Layer list</li>
            <li>Component list</li>
          </ul>
        </PlaceholderFrame>

        <PlaceholderFrame label="3D viewer" className="min-h-72">
          <div className="flex h-full min-h-56 items-center justify-center rounded-xl bg-background/80 text-sm text-muted-foreground">
            Viewer placeholder for {projectId}
          </div>
        </PlaceholderFrame>

        <PlaceholderFrame label="Agent chat">
          <div className="flex h-full min-h-56 flex-col justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Contextual chat. Active object / layer / component will land here
              later.
            </p>
            <div className="rounded-xl border bg-background px-3 py-2 text-sm text-muted-foreground">
              Message input placeholder
            </div>
          </div>
        </PlaceholderFrame>
      </div>
    </main>
  )
}
