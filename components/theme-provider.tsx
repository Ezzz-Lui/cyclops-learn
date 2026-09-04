"use client"

import * as React from "react"
import { useServerInsertedHTML } from "next/navigation"

import {
  applyTheme,
  disableThemeTransitions,
  readStoredTheme,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  type ColorTheme,
  type ThemePreference,
} from "@/lib/theme"

type ThemeContextValue = {
  theme: ThemePreference
  resolvedTheme: ColorTheme
  setTheme: (theme: ThemePreference) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemePreference>("system")
  const [resolvedTheme, setResolvedTheme] = React.useState<ColorTheme>("light")
  const didInsertScript = React.useRef(false)

  useServerInsertedHTML(() => {
    if (didInsertScript.current) {
      return null
    }
    didInsertScript.current = true
    return (
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
    )
  })

  const setTheme = React.useCallback((next: ThemePreference) => {
    const restoreTransitions = disableThemeTransitions()
    setThemeState(next)
    setResolvedTheme(applyTheme(next))
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // localStorage can throw in private mode
    }
    restoreTransitions()
  }, [])

  React.useEffect(() => {
    const stored = readStoredTheme()
    setThemeState(stored)
    setResolvedTheme(applyTheme(stored))

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onSystemChange = () => {
      const current = readStoredTheme()
      if (current === "system") {
        setResolvedTheme(applyTheme("system"))
      }
    }
    media.addEventListener("change", onSystemChange)

    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return
      }
      const next = readStoredTheme()
      setThemeState(next)
      setResolvedTheme(applyTheme(next))
    }
    window.addEventListener("storage", onStorage)

    return () => {
      media.removeEventListener("change", onSystemChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      <ThemeHotkey />
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }
