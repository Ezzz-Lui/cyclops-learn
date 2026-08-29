"use client"

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

import { buttonVariants } from "@/components/ui/button"

export function AuthControls() {
  return (
    <nav className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <button type="button" className={buttonVariants({ variant: "ghost" })}>
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <button type="button" className={buttonVariants()}>
            Sign up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </Show>
    </nav>
  )
}
