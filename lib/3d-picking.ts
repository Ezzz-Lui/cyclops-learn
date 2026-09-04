import {
  findBestPartForNodeNames,
  type HitVolume,
  type PartCatalogEntry,
  type PickingConfig,
  type Vec3Tuple,
} from "@/lib/part-catalog"

export type PointerIntent = "click" | "drag" | "ignore"

export type PickingMethod = "exact" | "hit" | "anchor" | "null" | "drag"

export type PickingResult = {
  method: Exclude<PickingMethod, "drag">
  partId: string | null
  gltfNodeName: string | null
  distance?: number
}

export type DragResult = {
  method: "drag"
  partId: null
  gltfNodeName: null
}

export type PointerResolution = PickingResult | DragResult

export type LocalBox = {
  min: Vec3Tuple
  size: Vec3Tuple
}

export const DEFAULT_CLICK_MAX_DELTA = 4

export function resolvePointerIntent(
  button: number,
  delta: number,
  clickMaxDelta: number = DEFAULT_CLICK_MAX_DELTA
): PointerIntent {
  if (button !== 0) return "ignore"
  if (delta > clickMaxDelta) return "drag"
  return "click"
}

export function distance3(a: Vec3Tuple, b: Vec3Tuple) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

export function pointInHitVolume(point: Vec3Tuple, volume: HitVolume) {
  if (volume.kind === "sphere") {
    return distance3(point, volume.center) <= volume.radius
  }
  return (
    point[0] >= volume.min[0] &&
    point[0] <= volume.max[0] &&
    point[1] >= volume.min[1] &&
    point[1] <= volume.max[1] &&
    point[2] >= volume.min[2] &&
    point[2] <= volume.max[2]
  )
}

export function resolvedAnchorForPart(
  part: PartCatalogEntry,
  localBox: LocalBox | null
): Vec3Tuple | null {
  if (part.anchor?.length === 3) {
    return [part.anchor[0], part.anchor[1], part.anchor[2]]
  }
  if (part.anchorNorm?.length === 3 && localBox) {
    return [
      localBox.min[0] + localBox.size[0] * part.anchorNorm[0],
      localBox.min[1] + localBox.size[1] * part.anchorNorm[1],
      localBox.min[2] + localBox.size[2] * part.anchorNorm[2],
    ]
  }
  return null
}

function emptyPick(gltfNodeName: string | null): PickingResult {
  return { method: "null", partId: null, gltfNodeName }
}

export function resolvePickedPart(args: {
  parts: PartCatalogEntry[]
  point: Vec3Tuple
  ancestorNames: string[]
  picking: PickingConfig | null
  localBox?: LocalBox | null
}): PickingResult {
  const gltfNodeName = args.ancestorNames[0] ?? null
  const mapped = findBestPartForNodeNames(args.parts, args.ancestorNames)
  if (mapped) {
    return {
      method: "exact",
      partId: mapped.id,
      gltfNodeName: gltfNodeName ?? mapped.nodes[0] ?? null,
    }
  }

  const containing = new Map<string, PartCatalogEntry>()
  for (const part of args.parts) {
    for (const volume of part.hitVolumes ?? []) {
      if (pointInHitVolume(args.point, volume)) {
        containing.set(part.id, part)
        break
      }
    }
  }

  if (containing.size === 1) {
    const part = [...containing.values()][0]
    if (!part) return emptyPick(gltfNodeName)
    return { method: "hit", partId: part.id, gltfNodeName }
  }
  if (containing.size > 1) {
    return emptyPick(gltfNodeName)
  }

  if (!args.picking) {
    return emptyPick(gltfNodeName)
  }

  const ranked: { part: PartCatalogEntry; distance: number }[] = []
  for (const part of args.parts) {
    const anchor = resolvedAnchorForPart(part, args.localBox ?? null)
    if (!anchor) continue
    ranked.push({ part, distance: distance3(args.point, anchor) })
  }
  ranked.sort((a, b) => a.distance - b.distance)

  const within = ranked.filter(
    (entry) => entry.distance <= args.picking!.anchorMaxDistance
  )
  const nearest = within[0]
  if (!nearest) return emptyPick(gltfNodeName)

  const second = within[1]
  if (
    second &&
    second.distance - nearest.distance < args.picking.anchorAmbiguityMargin
  ) {
    return emptyPick(gltfNodeName)
  }

  return {
    method: "anchor",
    partId: nearest.part.id,
    gltfNodeName,
    distance: nearest.distance,
  }
}

export function resolvePointerPick(args: {
  button: number
  delta: number
  parts: PartCatalogEntry[]
  point: Vec3Tuple
  ancestorNames: string[]
  picking: PickingConfig | null
  localBox?: LocalBox | null
}): PointerResolution | { method: "ignore" } {
  const intent = resolvePointerIntent(
    args.button,
    args.delta,
    args.picking?.clickMaxDelta ?? DEFAULT_CLICK_MAX_DELTA
  )
  if (intent === "ignore") return { method: "ignore" }
  if (intent === "drag") {
    return { method: "drag", partId: null, gltfNodeName: null }
  }
  return resolvePickedPart({
    parts: args.parts,
    point: args.point,
    ancestorNames: args.ancestorNames,
    picking: args.picking,
    localBox: args.localBox,
  })
}
