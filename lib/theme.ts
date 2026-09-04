export type ColorTheme = "light" | "dark"

export type ThemePreference = ColorTheme | "system"

export const THEME_STORAGE_KEY = "theme"

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system"
}

export function getSystemTheme(): ColorTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function resolveTheme(preference: ThemePreference): ColorTheme {
  return preference === "system" ? getSystemTheme() : preference
}

export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference)
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
  return resolved
}

export function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (isThemePreference(stored)) {
      return stored
    }
  } catch {
    // localStorage can throw in private mode
  }
  return "system"
}

export function disableThemeTransitions() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    window.setTimeout(() => {
      style.remove()
    }, 1)
  }
}

export const THEME_INIT_SCRIPT = `(()=>{try{var d=document.documentElement,s=localStorage.getItem("${THEME_STORAGE_KEY}")||"system",m=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",r=s==="system"?m:s;d.classList.remove("light","dark");d.classList.add(r);if(r==="dark"||r==="light")d.style.colorScheme=r}catch(e){}})()`
