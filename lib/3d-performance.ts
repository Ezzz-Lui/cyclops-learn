import type { PickingMethod, PointerResolution } from "@/lib/3d-picking"

export type QualityTier = "high" | "low"

export type FpsBand = "incline" | "decline" | "neutral"

export type PickingCounters = {
  exact: number
  hit: number
  anchor: number
  null: number
  drag: number
}

export type MetricsSnapshot = {
  comparable: boolean
  missing: string[]
  browser: string | null
  gpu: string | null
  viewport: { width: number; height: number } | null
  model: string | null
  route: string | null
  frameTimeP95Ms: number | null
  dpr: number | null
  qualityTier: QualityTier | null
  pointerRaycasts: number
  restFramesAfter2s: number | null
  drawCalls: number | null
  picking: PickingCounters
}

export const QUALITY_WINDOW_MS = 250
export const QUALITY_ITERATIONS = 10
export const QUALITY_CONSENSUS = 0.75
export const QUALITY_FLIPFLOP_LIMIT = 3

const REQUIRED_SNAPSHOT_FIELDS = [
  "browser",
  "gpu",
  "viewport",
  "model",
  "route",
  "frameTimeP95Ms",
  "dpr",
  "qualityTier",
  "pointerRaycasts",
  "restFramesAfter2s",
  "picking",
] as const

export function percentile(sorted: number[], ratio: number) {
  if (sorted.length === 0) return null
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(ratio * sorted.length) - 1)
  )
  return sorted[index] ?? null
}

export class RingBuffer {
  private readonly values: number[]
  private next = 0
  private filled = 0

  constructor(private readonly capacity: number) {
    this.values = Array.from({ length: capacity }, () => 0)
  }

  push(value: number) {
    const slot = this.values[this.next]
    if (slot === undefined) return
    this.values[this.next] = value
    this.next = (this.next + 1) % this.capacity
    this.filled = Math.min(this.capacity, this.filled + 1)
  }

  toArray() {
    if (this.filled < this.capacity) {
      return this.values.slice(0, this.filled)
    }
    return [...this.values.slice(this.next), ...this.values.slice(0, this.next)]
  }

  p95() {
    const sorted = this.toArray().slice().sort((a, b) => a - b)
    return percentile(sorted, 0.95)
  }

  get size() {
    return this.filled
  }
}

export function classifyFpsBand(fps: number, refreshRate: number): FpsBand {
  const low = refreshRate * 0.65
  const high = refreshRate * 0.85
  if (fps < low) return "decline"
  if (fps > high) return "incline"
  return "neutral"
}

export type QualityGovernorState = {
  tier: QualityTier
  locked: boolean
  flipFlops: number
  bands: FpsBand[]
}

export function createQualityGovernorState(): QualityGovernorState {
  return { tier: "high", locked: false, flipFlops: 0, bands: [] }
}

export function applyQualityBand(
  state: QualityGovernorState,
  band: FpsBand
): QualityGovernorState {
  if (state.locked) return state
  const bands = [...state.bands, band]
  if (bands.length < QUALITY_ITERATIONS) {
    return { ...state, bands }
  }

  const declines = bands.filter((item) => item === "decline").length
  const inclines = bands.filter((item) => item === "incline").length
  let nextTier = state.tier
  if (declines / QUALITY_ITERATIONS >= QUALITY_CONSENSUS) {
    nextTier = "low"
  } else if (inclines / QUALITY_ITERATIONS >= QUALITY_CONSENSUS) {
    nextTier = "high"
  }

  const flipFlops = state.flipFlops + (nextTier === state.tier ? 0 : 1)
  const locked = flipFlops >= QUALITY_FLIPFLOP_LIMIT
  return {
    tier: locked ? "low" : nextTier,
    locked,
    flipFlops,
    bands: [],
  }
}

export function dprForTier(tier: QualityTier, devicePixelRatio: number) {
  return Math.min(devicePixelRatio, tier === "high" ? 1.5 : 1)
}

export function emptyPickingCounters(): PickingCounters {
  return { exact: 0, hit: 0, anchor: 0, null: 0, drag: 0 }
}

export function snapshotMissingFields(snapshot: MetricsSnapshot) {
  const missing: string[] = []
  for (const field of REQUIRED_SNAPSHOT_FIELDS) {
    const value = snapshot[field]
    if (value === null || value === undefined) {
      missing.push(field)
    }
  }
  if (snapshot.viewport && (snapshot.viewport.width <= 0 || snapshot.viewport.height <= 0)) {
    missing.push("viewport")
  }
  return [...new Set(missing)]
}

export function withComparability(snapshot: Omit<MetricsSnapshot, "comparable" | "missing">) {
  const missing = snapshotMissingFields({ ...snapshot, comparable: true, missing: [] })
  return {
    ...snapshot,
    missing,
    comparable: missing.length === 0,
  } satisfies MetricsSnapshot
}

export type MetricsSessionInit = {
  model: string
  route: string
  browser?: string | null
  gpu?: string | null
  viewport?: { width: number; height: number } | null
}

export class MetricsSession {
  private readonly frames = new RingBuffer(180)
  private pointerRaycasts = 0
  private restFramesAfter2s: number | null = null
  private dpr: number | null = null
  private qualityTier: QualityTier | null = null
  private drawCalls: number | null = null
  private picking = emptyPickingCounters()
  private readonly model: string
  private readonly route: string
  private browser: string | null
  private gpu: string | null
  private viewport: { width: number; height: number } | null

  constructor(init: MetricsSessionInit) {
    this.model = init.model
    this.route = init.route
    this.browser = init.browser ?? null
    this.gpu = init.gpu ?? null
    this.viewport = init.viewport ?? null
  }

  setEnvironment(env: {
    browser?: string | null
    gpu?: string | null
    viewport?: { width: number; height: number } | null
  }) {
    if (env.browser !== undefined) this.browser = env.browser
    if (env.gpu !== undefined) this.gpu = env.gpu
    if (env.viewport !== undefined) this.viewport = env.viewport
  }

  recordFrameTime(ms: number) {
    if (Number.isFinite(ms) && ms >= 0) this.frames.push(ms)
  }

  recordPointerRaycast() {
    this.pointerRaycasts += 1
  }

  recordPick(method: PickingMethod) {
    this.picking[method] += 1
  }

  recordResolution(result: PointerResolution | { method: "ignore" }) {
    if (result.method === "ignore") return
    this.recordPick(result.method)
  }

  setRestFrames(count: number) {
    this.restFramesAfter2s = count
  }

  setDpr(value: number) {
    this.dpr = value
  }

  setQualityTier(tier: QualityTier) {
    this.qualityTier = tier
  }

  setDrawCalls(count: number) {
    this.drawCalls = count
  }

  snapshot(): MetricsSnapshot {
    return withComparability({
      browser: this.browser,
      gpu: this.gpu,
      viewport: this.viewport,
      model: this.model,
      route: this.route,
      frameTimeP95Ms: this.frames.p95(),
      dpr: this.dpr,
      qualityTier: this.qualityTier,
      pointerRaycasts: this.pointerRaycasts,
      restFramesAfter2s: this.restFramesAfter2s,
      drawCalls: this.drawCalls,
      picking: { ...this.picking },
    })
  }
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export type Cyclops3dHarness = {
  ready: boolean
  canvasReady: boolean
  model: string
  optimized: boolean
  lastPick: PointerResolution | null
  simulatePointer: (input: {
    button?: number
    delta: number
    point: [number, number, number]
    ancestors?: string[]
  }) => PointerResolution | { method: "ignore" }
  snapshot: () => MetricsSnapshot
}

declare global {
  interface Window {
    __cyclops3d?: Cyclops3dHarness
  }
}
