import { describe, expect, it } from "vitest"

import {
  pointInHitVolume,
  resolvePickedPart,
  resolvePointerIntent,
  resolvePointerPick,
} from "@/lib/3d-picking"
import type { PartCatalogEntry, PickingConfig } from "@/lib/part-catalog"

const picking: PickingConfig = {
  clickMaxDelta: 4,
  anchorMaxDistance: 0.035,
  anchorAmbiguityMargin: 0.012,
}

const parts: PartCatalogEntry[] = [
  {
    id: "input-shaft",
    label: "Input",
    labelEn: "Input",
    layer: "shafts",
    summary: "Input shaft",
    nodes: ["InputShaft"],
    anchor: [-0.18, 0.01, 0.06],
    hitVolumes: [{ kind: "sphere", center: [-0.18, 0.01, 0.06], radius: 0.016 }],
  },
  {
    id: "front-sync",
    label: "Front sync",
    labelEn: "Front sync",
    layer: "synchronizers",
    summary: "Front synchronizer",
    nodes: [],
    anchor: [-0.14, 0.02, 0.05],
    hitVolumes: [{ kind: "sphere", center: [-0.14, 0.02, 0.05], radius: 0.016 }],
  },
  {
    id: "lever",
    label: "Lever",
    labelEn: "Lever",
    layer: "shift",
    summary: "Lever",
    nodes: [],
    anchor: [-0.08, 0.12, 0.05],
    hitVolumes: [{ kind: "sphere", center: [-0.08, 0.12, 0.05], radius: 0.018 }],
  },
  {
    id: "countershaft",
    label: "Countershaft",
    labelEn: "Countershaft",
    layer: "shafts",
    summary: "Countershaft",
    nodes: [],
    anchor: [-0.09, -0.12, 0.05],
  },
]

describe("resolvePointerIntent", () => {
  it("treats a primary press within 4px as a click", () => {
    expect(resolvePointerIntent(0, 4, 4)).toBe("click")
  })

  it("treats movement above the threshold as a drag", () => {
    expect(resolvePointerIntent(0, 5, 4)).toBe("drag")
  })

  it("ignores non-primary buttons", () => {
    expect(resolvePointerIntent(2, 0, 4)).toBe("ignore")
  })
})

describe("pointInHitVolume", () => {
  it("includes points inside a sphere or box", () => {
    expect(
      pointInHitVolume([0, 0, 0], { kind: "sphere", center: [0, 0, 0], radius: 0.01 })
    ).toBe(true)
    expect(
      pointInHitVolume([0.5, 0.5, 0.5], {
        kind: "box",
        min: [0, 0, 0],
        max: [1, 1, 1],
      })
    ).toBe(true)
  })
})

describe("resolvePickedPart", () => {
  it("prefers exact node mapping over nearby hit volumes and anchors", () => {
    const result = resolvePickedPart({
      parts,
      point: [-0.14, 0.02, 0.05],
      ancestorNames: ["InputShaft_mesh"],
      picking,
    })
    expect(result).toMatchObject({ method: "exact", partId: "input-shaft" })
  })

  it("returns the unique hit volume when mappings are missing", () => {
    const result = resolvePickedPart({
      parts,
      point: [-0.08, 0.12, 0.05],
      ancestorNames: ["Mesh_12"],
      picking,
    })
    expect(result).toMatchObject({ method: "hit", partId: "lever" })
  })

  it("returns null when two hit volumes contain the point", () => {
    const overlapping: PartCatalogEntry[] = [
      {
        ...parts[0]!,
        hitVolumes: [{ kind: "sphere", center: [0, 0, 0], radius: 1 }],
      },
      {
        ...parts[1]!,
        hitVolumes: [{ kind: "sphere", center: [0.1, 0, 0], radius: 1 }],
      },
    ]
    const result = resolvePickedPart({
      parts: overlapping,
      point: [0, 0, 0],
      ancestorNames: [],
      picking,
    })
    expect(result).toMatchObject({ method: "null", partId: null })
  })

  it("may resolve a unique in-range anchor", () => {
    const result = resolvePickedPart({
      parts,
      point: [-0.09, -0.12, 0.05],
      ancestorNames: [],
      picking,
    })
    expect(result).toMatchObject({ method: "anchor", partId: "countershaft" })
  })

  it("returns null when two anchors are inside the threshold and too close", () => {
    const result = resolvePickedPart({
      parts,
      point: [-0.16, 0.015, 0.055],
      ancestorNames: [],
      picking,
    })
    expect(result).toMatchObject({ method: "null", partId: null })
  })

  it("returns null for a far miss and without picking config", () => {
    expect(
      resolvePickedPart({
        parts,
        point: [4, 4, 4],
        ancestorNames: [],
        picking,
      })
    ).toMatchObject({ method: "null", partId: null })

    expect(
      resolvePickedPart({
        parts,
        point: [-0.09, -0.12, 0.05],
        ancestorNames: [],
        picking: null,
      })
    ).toMatchObject({ method: "null", partId: null })
  })
})

describe("resolvePointerPick", () => {
  it("does not select a part on drag", () => {
    const result = resolvePointerPick({
      button: 0,
      delta: 12,
      parts,
      point: [-0.08, 0.12, 0.05],
      ancestorNames: [],
      picking,
    })
    expect(result).toMatchObject({ method: "drag", partId: null })
  })
})
