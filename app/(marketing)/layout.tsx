import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/" className="text-sm font-medium">
          Cyclops AI
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonVariants()}>
            Sign up
          </Link>
        </nav>
      </header>
      {children}
    </div>
  )
}
