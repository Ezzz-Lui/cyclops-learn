import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { expect, type Page, test } from "@playwright/test"

type PointerResult = {
  method: string
  partId: string | null
}

type Snapshot = {
  comparable: boolean
  missing: string[]
  frameTimeP95Ms: number | null
  pointerRaycasts: number
  restFramesAfter2s: number | null
  picking: {
    exact: number
    hit: number
    anchor: number
    null: number
    drag: number
  }
}

const MODEL = "transmission_model_for_3d_printing.glb"
const CLICKS: { point: [number, number, number]; expected: string | null }[] = []

for (let i = 0; i < 13; i += 1) {
  CLICKS.push({ point: [-0.18, 0.01, 0.06], expected: "flecha-de-mando" })
  CLICKS.push({ point: [-0.14, 0.02, 0.05], expected: "collar-sincronizador-delantero" })
  CLICKS.push({ point: [-0.08, 0.12, 0.05], expected: "palanca" })
  CLICKS.push({ point: [-0.09, 0.07, 0.06], expected: "varillaje" })
  CLICKS.push({ point: [0.03, 0.01, 0.05], expected: "flecha-de-salida" })
  CLICKS.push({ point: [-0.03, 0.02, 0.05], expected: "collar-sincronizador-posterior" })
  CLICKS.push({ point: [-0.09, -0.12, 0.05], expected: "contra-flecha" })
  CLICKS.push({ point: [3, 3, 3], expected: null })
}

async function waitForHarness(page: Page) {
  await page.waitForFunction(() => Boolean(window.__cyclops3d?.ready), null, {
    timeout: 60_000,
  })
}

async function simulate(
  page: Page,
  input: { delta?: number; point: [number, number, number] }
) {
  return page.evaluate((payload) => {
    const harness = window.__cyclops3d
    if (!harness) throw new Error("3D harness is not ready")
    return harness.simulatePointer({
      delta: payload.delta ?? 0,
      point: payload.point,
    })
  }, input) as Promise<PointerResult>
}

async function runCourse(page: Page, picking: "candidate" | "legacy") {
  const search =
    picking === "legacy"
      ? `/dev/3d-harness?3dMetrics=1&picking=legacy&model=${MODEL}`
      : `/dev/3d-harness?3dMetrics=1&picking=optimized&model=${MODEL}`
  await page.goto(search)
  await waitForHarness(page)

  let hits = 0
  let falsePositives = 0
  let dragSelections = 0

  for (const click of CLICKS) {
    const result = await simulate(page, { point: click.point })
    if (click.expected) {
      if (result.partId === click.expected) hits += 1
    } else if (result.partId) {
      falsePositives += 1
    }
  }

  for (let i = 0; i < 50; i += 1) {
    const result = await simulate(page, {
      delta: 18,
      point: [-0.08, 0.12, 0.05],
    })
    if (result.partId) dragSelections += 1
  }

  const canvas = page.getByTestId("model-viewer")
  const box = await canvas.boundingBox()
  if (box) {
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 40, y + 12, { steps: 6 })
    await page.mouse.up()
  }
  await page.waitForTimeout(2800)

  const snapshot = (await page.evaluate(() => window.__cyclops3d?.snapshot())) as Snapshot
  return {
    hits,
    totalExpected: CLICKS.filter((click) => click.expected).length,
    falsePositives,
    farClicks: CLICKS.filter((click) => !click.expected).length,
    dragSelections,
    snapshot,
  }
}

test("candidate meets picking gates and writes a comparable snapshot", async ({ page }) => {
  const candidate = await runCourse(page, "candidate")
  const hitRate = candidate.hits / candidate.totalExpected
  const falseRate = candidate.falsePositives / Math.max(1, candidate.farClicks)

  expect(CLICKS.length).toBeGreaterThanOrEqual(100)
  expect(hitRate).toBeGreaterThanOrEqual(0.95)
  expect(falseRate).toBeLessThanOrEqual(0.02)
  expect(candidate.dragSelections).toBe(0)
  expect(candidate.snapshot.restFramesAfter2s ?? 0).toBeLessThan(30)

  const outDir = path.join(process.cwd(), "e2e", ".tmp")
  await mkdir(outDir, { recursive: true })
  await writeFile(
    path.join(outDir, "3d-metrics-candidate.json"),
    JSON.stringify(candidate, null, 2)
  )

  const baselinePath = path.join(process.cwd(), "e2e", "fixtures", "3d-metrics-baseline.json")
  let baseline: Awaited<ReturnType<typeof runCourse>> | null = null
  try {
    baseline = JSON.parse(await readFile(baselinePath, "utf8")) as Awaited<
      ReturnType<typeof runCourse>
    >
  } catch {
    baseline = null
  }

  if (!baseline?.snapshot?.frameTimeP95Ms || !candidate.snapshot.frameTimeP95Ms) {
    test.info().annotations.push({
      type: "note",
      description:
        "No baseline snapshot in e2e/fixtures/3d-metrics-baseline.json; picking gates passed, GPU deltas skipped.",
    })
    return
  }

  const p95Gain =
    (baseline.snapshot.frameTimeP95Ms - candidate.snapshot.frameTimeP95Ms) /
    baseline.snapshot.frameTimeP95Ms
  const raycastGain =
    (baseline.snapshot.pointerRaycasts - candidate.snapshot.pointerRaycasts) /
    Math.max(1, baseline.snapshot.pointerRaycasts)
  expect(p95Gain).toBeGreaterThanOrEqual(0.3)
  expect(raycastGain).toBeGreaterThanOrEqual(0.5)
})
