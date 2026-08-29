import type { Metadata } from "next"
import Link from "next/link"

import { PlaceholderFrame } from "@/components/placeholders/placeholder-frame"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function SignInPage() {
  return (
    <PlaceholderFrame label="Clerk SignIn" className="w-full max-w-sm">
      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-lg font-medium">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Clerk is not installed yet. Drop <code>&lt;SignIn /&gt;</code> here
            when the Clerk UI components are available. Catch-all route is
            already <code>/sign-in/[[...sign-in]]</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/sign-up" className={buttonVariants({ variant: "outline" })}>
            Sign up
          </Link>
          <Link href="/home" className={buttonVariants()}>
            Continue to home
          </Link>
        </div>
      </div>
    </PlaceholderFrame>
  )
}
