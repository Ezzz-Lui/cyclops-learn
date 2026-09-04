export function modelFilenameFromSrc(src: string) {
  const path = src.split("?")[0] ?? src
  const segments = path.split("/")
  return decodeURIComponent(segments[segments.length - 1] ?? "")
}

function readPublicFlag() {
  return (process.env.NEXT_PUBLIC_3D_OPTIMIZED ?? "").trim().toLowerCase()
}

function pickingOverride() {
  if (typeof window === "undefined") return null
  const value = new URLSearchParams(window.location.search).get("picking")
  if (value === "legacy" || value === "optimized") return value
  return null
}

/** `transmission` enables the candidate path for that model; `all`/`true`/`1` enables every model. */
export function is3dOptimizationEnabled(modelFilename: string) {
  const override = pickingOverride()
  if (override === "legacy") return false
  if (override === "optimized") return true
  const flag = readPublicFlag()
  if (flag === "all" || flag === "true" || flag === "1") return true
  if (flag === "transmission") {
    return modelFilename.toLowerCase().includes("transmission")
  }
  return false
}

export function is3dMetricsQueryEnabled() {
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).get("3dMetrics") === "1"
}
