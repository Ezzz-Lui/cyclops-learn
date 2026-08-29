import Link from "next/link"

import { AuthControls } from "@/components/auth/auth-controls"

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
        <AuthControls />
      </header>
      {children}
    </div>
  )
}
