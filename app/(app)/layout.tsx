import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

import { AuthControls } from "@/components/auth/auth-controls"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await auth.protect()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/home" className="text-sm font-medium">
            Cyclops AI
          </Link>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/home" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/canvas" className="hover:text-foreground">
              Canvas
            </Link>
          </nav>
        </div>
        <AuthControls />
      </header>
      {children}
    </div>
  )
}
