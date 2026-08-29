export const MOTO_ENGINE_SLUG = "moto-engine"

export const MOTO_ENGINE_OVERVIEW =
  "Motorcycle internal combustion engine (ICE). Air-cooled single with crankcase, cylinder and piston, head and valves, cooling fins, intake/carburetor, exhaust, ignition, and fasteners. Sketchfab meshes stay Object_N until a curator maps them."

export const ICE_SYSTEMS = [
  {
    id: "crankcase",
    name: "Crankcase",
    blurb: "Lower housing for the crankshaft. Holds oil and is the structural base of the engine.",
  },
  {
    id: "cylinder",
    name: "Cylinder and piston",
    blurb: "The piston travels in the bore. Combustion pressure here becomes rotation at the crank.",
  },
  {
    id: "head",
    name: "Cylinder head and valves",
    blurb: "Closes the combustion chamber. Intake and exhaust valves time the gas exchange.",
  },
  {
    id: "cooling",
    name: "Cooling fins",
    blurb: "Extra surface area on barrel and head. Air flow dumps heat on an air-cooled moto ICE.",
  },
  {
    id: "intake",
    name: "Intake and carburetor",
    blurb: "Meters air and fuel into the cylinder. Usually sits on the head intake port.",
  },
  {
    id: "exhaust",
    name: "Exhaust",
    blurb: "Takes burned gas out of the head. Header plus muffler on a motorcycle.",
  },
  {
    id: "ignition",
    name: "Ignition",
    blurb: "Spark plug and coil fire the mixture near top dead center.",
  },
] as const

const UNLABELED_SUMMARY =
  "Unlabeled Sketchfab mesh. The student did select it. Teach from ICE systems; do not ask them to click again."

export type CuratedPart = {
  label: string
  layer: string
  summary: string
}

// Map a node only after you identify it on the canvas. 2-4 sentences: what it is, where it sits, one teaching beat. Do not invent names for Object_N.
export const CURATED_PARTS: Record<string, CuratedPart> = {}

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
  return motoEngineNodes().map((gltfNodeName) => {
    const curated = CURATED_PARTS[gltfNodeName]
    if (curated) {
      return {
        gltfNodeName,
        label: curated.label,
        layer: curated.layer,
        summary: curated.summary,
        teachable: true,
      }
    }
    return {
      gltfNodeName,
      label: humanizeNode(gltfNodeName),
      layer: "assembly",
      summary: UNLABELED_SUMMARY,
      teachable: false,
    }
  })
}
