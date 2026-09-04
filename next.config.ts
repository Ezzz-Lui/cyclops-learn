import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
}

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

export default withNextIntl(nextConfig)
