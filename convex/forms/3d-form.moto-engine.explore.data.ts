import type { Form3DData } from "./types"

const motoEngineExplore: Form3DData = {
  slug: "moto-engine",
  useCase: "explore",
  domain: "mechanics",
  title: "Motorcycle ICE",
  modelFilename: "internal_combustion_engine_moto.glb",
  overview:
    "Motorcycle internal combustion engine (ICE). Named parts live in internal_combustion_engine_moto.parts.json: bloque, pistón, cigüeñal, biela, culata. Sketchfab meshes stay Object_N until a node is mapped in that file.",
  unlabeledSummary:
    "Unlabeled Sketchfab mesh. The student did select it. Teach from ICE systems; do not ask them to click again.",
  meshIndex: {
    extras: ["Sketchfab_model", "ICE_moto.obj.cleaner.materialmerger.gles"],
    objectFrom: 2,
    objectTo: 136,
  },
  systems: [
    {
      id: "block",
      name: "Bloque del motor",
      blurb:
        "Fundición principal. Aloja los cilindros y da soporte al cigüeñal y al resto del motor.",
    },
    {
      id: "piston",
      name: "Pistón",
      blurb:
        "Se mueve hacia arriba y hacia abajo en el orificio del cilindro. La combustión empuja el pistón.",
    },
    {
      id: "crank",
      name: "Cigüeñal",
      blurb:
        "Convierte el movimiento ascendente y descendente de los pistones en rotación.",
    },
    {
      id: "rod",
      name: "Biela",
      blurb: "Conecta el pistón al cigüeñal y transmite la fuerza lineal a la muñequilla.",
    },
    {
      id: "head",
      name: "Culata",
      blurb: "Cierra la cámara de combustión. Aloja válvulas y el tren de admisión/escape.",
    },
    {
      id: "crankcase",
      name: "Crankcase",
      blurb:
        "Lower housing for the crankshaft. Holds oil and is the structural base of the engine.",
    },
    {
      id: "cylinder",
      name: "Cylinder and piston",
      blurb:
        "The piston travels in the bore. Combustion pressure here becomes rotation at the crank.",
    },
    {
      id: "cooling",
      name: "Cooling fins",
      blurb:
        "Extra surface area on barrel and head. Air flow dumps heat on an air-cooled moto ICE.",
    },
    {
      id: "intake",
      name: "Intake and carburetor",
      blurb:
        "Meters air and fuel into the cylinder. Usually sits on the head intake port.",
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
  ],
  parts: {},
  activities: [
    {
      id: "locate-cooling",
      kind: "select",
      targetLayer: "cooling",
      prompt:
        "Click a mesh that looks like cooling fins: thin stacked plates on the barrel or head.",
    },
    {
      id: "locate-intake",
      kind: "select",
      targetLayer: "intake",
      prompt:
        "Find the intake side of the head (carburetor / intake tract) and click that mesh.",
    },
    {
      id: "compare-hot-path",
      kind: "compare",
      prompt:
        "After any mesh, click a second one closer to the combustion chamber (barrel or head) and say why it should run hotter.",
    },
    {
      id: "explain-air-path",
      kind: "explain",
      prompt:
        "Trace air: intake → cylinder → exhaust. Click a mesh you think sits on that path and explain your guess.",
    },
  ],
}

export default motoEngineExplore
