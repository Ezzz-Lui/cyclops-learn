import { describe, expect, it } from "vitest"

import {
  applyQualityBand,
  classifyFpsBand,
  createQualityGovernorState,
  dprForTier,
  MetricsSession,
  QUALITY_ITERATIONS,
  RingBuffer,
  snapshotMissingFields,
  withComparability,
} from "@/lib/3d-performance"

describe("RingBuffer p95", () => {
  it("returns null until values exist and then the 95th percentile", () => {
    const buffer = new RingBuffer(120)
    expect(buffer.p95()).toBeNull()
    for (let i = 1; i <= 100; i += 1) {
      buffer.push(i)
    }
    expect(buffer.p95()).toBe(95)
  })

  it("keeps a fixed window when capacity is exceeded", () => {
    const buffer = new RingBuffer(5)
    for (let i = 1; i <= 8; i += 1) {
      buffer.push(i)
    }
    expect(buffer.toArray()).toEqual([4, 5, 6, 7, 8])
  })
})

describe("quality governor", () => {
  it("classifies fps against 65-85% of refresh", () => {
    expect(classifyFpsBand(30, 60)).toBe("decline")
    expect(classifyFpsBand(45, 60)).toBe("neutral")
    expect(classifyFpsBand(55, 60)).toBe("incline")
  })

  it("drops to low after consensus declines and locks after flip-flops", () => {
    let state = createQualityGovernorState()
    for (let i = 0; i < QUALITY_ITERATIONS; i += 1) {
      state = applyQualityBand(state, "decline")
    }
    expect(state.tier).toBe("low")

    for (let i = 0; i < QUALITY_ITERATIONS; i += 1) {
      state = applyQualityBand(state, "incline")
    }
    expect(state.tier).toBe("high")

    for (let i = 0; i < QUALITY_ITERATIONS; i += 1) {
      state = applyQualityBand(state, "decline")
    }
    expect(state.tier).toBe("low")
    expect(state.locked).toBe(true)
    expect(state.flipFlops).toBe(3)

    for (let i = 0; i < QUALITY_ITERATIONS; i += 1) {
      state = applyQualityBand(state, "incline")
    }
    expect(state.tier).toBe("low")
    expect(state.locked).toBe(true)
  })

  it("caps DPR per tier", () => {
    expect(dprForTier("high", 2)).toBe(1.5)
    expect(dprForTier("low", 2)).toBe(1)
  })
})

describe("metrics snapshots", () => {
  it("marks incomplete snapshots as not comparable", () => {
    const snapshot = withComparability({
      browser: null,
      gpu: null,
      viewport: null,
      model: null,
      route: null,
      frameTimeP95Ms: null,
      dpr: null,
      qualityTier: null,
      pointerRaycasts: 0,
      restFramesAfter2s: null,
      drawCalls: null,
      picking: { exact: 0, hit: 0, anchor: 0, null: 0, drag: 0 },
    })
    expect(snapshot.comparable).toBe(false)
    expect(snapshotMissingFields(snapshot).length).toBeGreaterThan(0)
  })

  it("marks a complete snapshot comparable after recording frames", () => {
    const session = new MetricsSession({
      model: "transmission_model_for_3d_printing.glb",
      route: "/dev/3d-harness",
      browser: "test-agent",
      gpu: "test-gpu",
      viewport: { width: 1280, height: 720 },
    })
    for (let i = 8; i <= 20; i += 1) {
      session.recordFrameTime(i)
    }
    session.recordPointerRaycast()
    session.recordPick("hit")
    session.setDpr(1.5)
    session.setQualityTier("high")
    session.setRestFrames(0)
    session.setDrawCalls(40)
    const snapshot = session.snapshot()
    expect(snapshot.comparable).toBe(true)
    expect(snapshot.frameTimeP95Ms).toBeGreaterThan(0)
    expect(snapshot.picking.hit).toBe(1)
  })
})
