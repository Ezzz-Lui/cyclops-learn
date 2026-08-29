export const MOTO_ENGINE_SLUG = "moto-engine"

export const MOTO_ENGINE_OVERVIEW =
  "Motorcycle internal combustion engine (ICE). Typical systems: crankcase, cylinder and piston, cylinder head and valves, cooling fins, carburetor/intake, exhaust, ignition, and fasteners. Individual Sketchfab meshes are named Object_N until they are curated."

const UNLABELED_SUMMARY =
  "This mesh is part of the motorcycle ICE assembly but is not curated yet. Ask about nearby systems (cooling fins, cylinder, intake, exhaust) or pick another part."

function humanizeNode(name: string) {
  return name.replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim() || name
}

export function motoEngineNodes() {
  const nodes = [
    "Sketchfab_model",
    "ICE_moto.obj.cleaner.materialmerger.gles",
  ]
  for (let index = 2; index <= 136; index += 1) {
    nodes.push(`Object_${index}`)
  }
  return nodes
}

export function motoEngineParts() {
  return motoEngineNodes().map((gltfNodeName) => ({
    gltfNodeName,
    label: humanizeNode(gltfNodeName),
    layer: "assembly",
    summary: UNLABELED_SUMMARY,
    teachable: false,
  }))
}
