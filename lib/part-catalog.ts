import livingRoomCatalog from "@/3Dmodels/architecture/living_room.parts.json"
import bambooCatalog from "@/3Dmodels/architecture/bamboo_structural_system.parts.json"
import motherboardCatalog from "@/3Dmodels/IT_infraestructure/motherboard__components.parts.json"
import serverCatalog from "@/3Dmodels/IT_infraestructure/server_v2_console.parts.json"
import engineCatalog from "@/3Dmodels/mechanics/internal_combustion_engine_moto.parts.json"
import transmissionCatalog from "@/3Dmodels/mechanics/transmission_model_for_3d_printing.parts.json"

export type Vec3Tuple = [number, number, number]

export type HitVolume =
  | { kind: "sphere"; center: Vec3Tuple; radius: number }
  | { kind: "box"; min: Vec3Tuple; max: Vec3Tuple }

export type PickingConfig = {
  clickMaxDelta: number
  anchorMaxDistance: number
  anchorAmbiguityMargin: number
}

export type PartCatalogEntry = {
  id: string
  diagramIndex?: number
  label: string
  labelEn: string
  layer: string
  summary: string
  nodes: string[]
  anchor?: number[]
  anchorNorm?: number[]
  hitVolumes?: HitVolume[]
}

export type PartCatalog = {
  slug: string
  modelFilename: string
  domain: string
  title: string
  source: string
  overview: string
  picking?: PickingConfig
  parts: PartCatalogEntry[]
}

function asCatalog(data: unknown): PartCatalog {
  return data as PartCatalog
}

const CATALOGS: PartCatalog[] = [
  asCatalog(engineCatalog),
  asCatalog(transmissionCatalog),
  asCatalog(motherboardCatalog),
  asCatalog(serverCatalog),
  asCatalog(livingRoomCatalog),
  asCatalog(bambooCatalog),
]

const byFilename = new Map(
  CATALOGS.map((catalog) => [catalog.modelFilename, catalog])
)

export function listPartCatalogs() {
  return CATALOGS
}

export function getPartCatalog(modelFilename: string) {
  return byFilename.get(modelFilename) ?? null
}

/** Per-model picking thresholds. Missing config means no unbounded nearest-anchor fallback. */
export function getPickingConfig(modelFilename: string): PickingConfig | null {
  return getPartCatalog(modelFilename)?.picking ?? null
}

export function findPartById(modelFilename: string, partId: string) {
  const catalog = getPartCatalog(modelFilename)
  if (!catalog) return null
  return catalog.parts.find((part) => part.id === partId) ?? null
}

export function nodeMatchesToken(nodeName: string, token: string) {
  return nodeName === token || nodeName.startsWith(token)
}

export function partMatchesNodeNames(part: PartCatalogEntry, nodeNames: string[]) {
  return part.nodes.some((token) =>
    nodeNames.some((name) => nodeMatchesToken(name, token))
  )
}

/** Prefer the nearest ancestor (first name) and the longest token if several parts match. */
export function findBestPartForNodeNames(
  parts: PartCatalogEntry[],
  nodeNames: string[]
) {
  for (const name of nodeNames) {
    let best: { part: PartCatalogEntry; score: number } | null = null
    for (const part of parts) {
      let score = 0
      for (const token of part.nodes) {
        if (nodeMatchesToken(name, token)) {
          score = Math.max(score, token.length)
        }
      }
      if (score > 0 && (!best || score > best.score)) {
        best = { part, score }
      }
    }
    if (best) return best.part
  }
  return null
}

export function findPartByNode(modelFilename: string, gltfNodeName: string) {
  const catalog = getPartCatalog(modelFilename)
  if (!catalog) return null
  return findBestPartForNodeNames(catalog.parts, [gltfNodeName])
}

export function catalogMarkers(modelFilename: string) {
  const catalog = getPartCatalog(modelFilename)
  if (!catalog) return []
  return catalog.parts.filter((part) => part.anchor || part.anchorNorm)
}

export function partHasAnchor(part: PartCatalogEntry) {
  return Boolean(part.anchor?.length === 3 || part.anchorNorm?.length === 3)
}
