import Link from "next/link"

import { AuthControls } from "@/components/auth/auth-controls"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/75 px-6 py-4 backdrop-blur-md">
        <Link
          href="/"
          className="font-heading text-sm font-medium tracking-tight"
        >
          Cyclops
          <span className="ml-2 inline-block size-1.5 rounded-full bg-primary align-middle" />
        </Link>
        <AuthControls />
      </header>
      {children}
    </div>
  )
}
