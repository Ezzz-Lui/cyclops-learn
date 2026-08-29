import type { Form3DData } from "./types"

const serverExplore: Form3DData = {
  slug: "server",
  useCase: "explore",
  domain: "computing",
  title: "Rack de servidores",
  modelFilename: "server_v2_console.glb",
  overview:
    "19-inch rack: UPS on top, 1U servers, pull-out KVM console, storage at the bottom. Zones live in server_v2_console.parts.json.",
  unlabeledSummary:
    "Unlabeled Sketchfab mesh. Teach from server systems; do not invent a specific Object_N name.",
  meshIndex: {
    extras: ["Sketchfab_model", "ServerV2+console.obj.cleaner.materialmerger.gles"],
    objectFrom: 1,
    objectTo: 0,
  },
  systems: [
    {
      id: "chassis",
      name: "Rack",
      blurb: "Bastidor de 19 pulgadas que apila UPS, servidores y almacenamiento.",
    },
    {
      id: "power",
      name: "UPS",
      blurb: "Alimentación ininterrumpida en la parte alta del rack.",
    },
    {
      id: "compute",
      name: "Servidores",
      blurb: "Unidades 1U/2U con LEDs de estado.",
    },
    {
      id: "console",
      name: "Consola KVM",
      blurb: "Bandeja extraíble con pantalla y teclado.",
    },
    {
      id: "storage",
      name: "Almacenamiento",
      blurb: "Unidad baja: bahías y discos.",
    },
  ],
  parts: {},
  activities: [
    {
      id: "locate-console",
      kind: "select",
      targetLayer: "console",
      prompt: "Click the console screen or keyboard.",
    },
    {
      id: "locate-bays",
      kind: "select",
      targetLayer: "storage",
      prompt: "Find the drive bays on the front of the chassis.",
    },
    {
      id: "explain-front",
      kind: "explain",
      prompt: "Click the front of the server and say what an operator would use it for.",
    },
  ],
}

export default serverExplore
