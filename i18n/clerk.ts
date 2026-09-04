import { enUS, esMX, zhCN } from "@clerk/localizations"

import type { AppLocale } from "./config"

export const clerkLocalizations = {
  es: esMX,
  en: enUS,
  zh: zhCN,
} as const satisfies Record<AppLocale, typeof esMX>
