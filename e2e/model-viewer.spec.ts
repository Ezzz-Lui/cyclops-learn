import { expect, type Page, test } from "@playwright/test"

type PointerResult = {
  method: string
  partId: string | null
}

async function waitForHarness(page: Page) {
  await expect(page.getByTestId("harness-ready")).toBeVisible()
  await page.waitForFunction(() => Boolean(window.__cyclops3d?.ready), null, {
    timeout: 20_000,
  })
}

async function simulate(
  page: Page,
  input: { delta?: number; point: [number, number, number]; ancestors?: string[] }
) {
  return page.evaluate((payload) => {
    const harness = window.__cyclops3d
    if (!harness) throw new Error("3D harness is not ready")
    return harness.simulatePointer({
      delta: payload.delta ?? 0,
      point: payload.point,
      ancestors: payload.ancestors,
    })
  }, input) as Promise<PointerResult>
}

test.describe("model viewer picking", () => {
  test("selects a unique hit volume and ignores far/null picks", async ({ page }) => {
    await page.goto("/dev/3d-harness?3dMetrics=1&picking=optimized")
    await waitForHarness(page)

    const hit = await simulate(page, { point: [-0.08, 0.12, 0.05] })
    expect(hit.method).toBe("hit")
    expect(hit.partId).toBe("palanca")
    await expect(page.getByTestId("selected-part-label")).toHaveText("Palanca")

    const missed = await simulate(page, { point: [4, 4, 4] })
    expect(missed.method).toBe("null")
    expect(missed.partId).toBeNull()
    await expect(page.getByTestId("selected-part-label")).toHaveText("Palanca")
  })

  test("does not change selection on drag", async ({ page }) => {
    await page.goto("/dev/3d-harness?3dMetrics=1&picking=optimized")
    await waitForHarness(page)

    await simulate(page, { point: [-0.08, 0.12, 0.05] })
    await expect(page.getByTestId("selected-part-label")).toHaveText("Palanca")

    const drag = await simulate(page, { delta: 24, point: [-0.18, 0.01, 0.06] })
    expect(drag.method).toBe("drag")
    expect(drag.partId).toBeNull()
    await expect(page.getByTestId("selected-part-label")).toHaveText("Palanca")
  })
})

test.describe("model viewer camera", () => {
  test("loads, resizes, focuses and orbits without freezing controls", async ({ page }) => {
    await page.goto("/dev/3d-harness?3dMetrics=1&picking=optimized")
    await waitForHarness(page)

    await expect(page.getByTestId("model-viewer")).toBeVisible()
    await expect(page.getByTestId("reset-view")).toBeVisible({ timeout: 90_000 })

    await page.setViewportSize({ width: 900, height: 640 })
    await page.getByTestId("reset-view").click()
    await page.getByTestId("focus-selected").click()

    const canvas = page.getByTestId("model-viewer")
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    if (!box) return

    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 80, y + 20, { steps: 8 })
    await page.mouse.up()

    await expect(page.getByTestId("reset-view")).toBeEnabled()
    await page.waitForTimeout(3500)

    const restFrames = await page.evaluate(() => window.__cyclops3d?.snapshot().restFramesAfter2s ?? -1)
    expect(restFrames).toBeGreaterThanOrEqual(0)
    const optimized = await page.evaluate(() => window.__cyclops3d?.optimized)
    if (optimized) {
      // Demand loop should not keep a 60fps spin (~120 frames / 2s). A few Bounds/damping frames are ok.
      expect(restFrames).toBeLessThan(30)
    }
  })
})
