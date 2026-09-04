import { enUS, esMX } from "@clerk/localizations"

import type { AppLocale } from "./config"

export const clerkLocalizations = {
  es: esMX,
  en: enUS,
} as const satisfies Record<AppLocale, typeof esMX>
