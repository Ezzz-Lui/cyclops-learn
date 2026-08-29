import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Landing
        </Link>
      </header>
      {children}
    </div>
  )
}
