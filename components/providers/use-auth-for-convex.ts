"use client"

import { useAuth } from "@clerk/nextjs"
import { useCallback } from "react"

const TOKEN_WAIT_MS = 8000

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T | null>((resolve, reject) => {
    const timer = window.setTimeout(() => resolve(null), ms)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        window.clearTimeout(timer)
        reject(error)
      }
    )
  })
}

export function useAuthForConvex() {
  const auth = useAuth()

  const getToken = useCallback(
    async (options?: Parameters<typeof auth.getToken>[0]) => {
      try {
        const token = await withTimeout(auth.getToken(options), TOKEN_WAIT_MS)
        if (!token && options?.template === "convex") {
          console.error(
            "Clerk did not return a Convex JWT. Check that this app has a JWT template named convex and NEXT_PUBLIC_CONVEX_URL points to the shared dev deployment."
          )
        }
        return token
      } catch (error) {
        console.error("Clerk getToken for Convex failed", error)
        return null
      }
    },
    [auth]
  )

  return {
    isLoaded: auth.isLoaded,
    isSignedIn: auth.isSignedIn,
    getToken,
    orgId: auth.orgId,
    orgRole: auth.orgRole,
    sessionId: auth.sessionId,
    sessionClaims: auth.sessionClaims,
  }
}
