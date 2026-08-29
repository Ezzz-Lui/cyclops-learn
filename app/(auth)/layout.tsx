import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6">
      <Link href="/" className="mb-8 text-sm font-medium">
        Cyclops AI
      </Link>
      {children}
    </div>
  )
}
