import type { Form3DData } from "./types"

const transmissionExplore: Form3DData = {
  slug: "transmission",
  useCase: "explore",
  domain: "mechanics",
  title: "Caja de cambios",
  modelFilename: "transmission_model_for_3d_printing.glb",
  overview:
    "Manual gearbox. Named parts live in transmission_model_for_3d_printing.parts.json. Sketchfab meshes stay Object_N until a node is mapped in that file.",
  unlabeledSummary:
    "Unlabeled Sketchfab mesh. Teach from the gearbox systems in the parts catalog; do not invent a specific Object_N name.",
  meshIndex: {
    extras: [
      "Sketchfab_model",
      "Transmission model (for 3D Printing).obj.cleaner.materialmerger.gles",
    ],
    objectFrom: 2,
    objectTo: 72,
  },
  systems: [
    {
      id: "shafts",
      name: "Flechas",
      blurb:
        "Flecha de mando (entrada), contra flecha (eje inferior) y flecha de salida. El par entra, se reduce y sale.",
    },
    {
      id: "housing",
      name: "Caja de la transmisión",
      blurb: "Carcasa que contiene engranes, flechas y aceite.",
    },
    {
      id: "shift",
      name: "Palanca y varillaje",
      blurb:
        "La palanca mueve el varillaje (varillas y horquillas) para desplazar los collares sincronizadores.",
    },
    {
      id: "synchronizers",
      name: "Collares sincronizadores",
      blurb:
        "Collar delantero (lado entrada) y posterior (lado salida). Igualan velocidad antes de engranar.",
    },
    {
      id: "gears",
      name: "Engranes",
      blurb:
        "Pares de engranes en las flechas. El engrane de reversa invierte el sentido de giro.",
    },
  ],
  parts: {},
  activities: [
    {
      id: "locate-input",
      kind: "select",
      targetLayer: "shafts",
      prompt:
        "Find the input side of the gearbox (flecha de mando) and click a mesh there.",
    },
    {
      id: "locate-shift",
      kind: "select",
      targetLayer: "shift",
      prompt: "Click a mesh on the shifter or linkage on top of the case.",
    },
    {
      id: "explain-path",
      kind: "explain",
      prompt:
        "Trace power: flecha de mando → contra flecha → flecha de salida. Click a mesh on that path and say which shaft you think it is.",
    },
  ],
}

export default transmissionExplore
