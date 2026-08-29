import type { AuthConfig } from "convex/server"

const clerkIssuer =
  process.env.CLERK_JWT_ISSUER_DOMAIN ??
  "https://hip-chow-3974.clerk.accounts.dev"

export default {
  providers: [
    {
      domain: clerkIssuer,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig
