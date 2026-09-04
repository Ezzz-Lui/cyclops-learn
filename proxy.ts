import { clerkMiddleware } from "@clerk/nextjs/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

export default clerkMiddleware(async (_auth, req) => {
  if (
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/trpc")
  ) {
    return
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}
