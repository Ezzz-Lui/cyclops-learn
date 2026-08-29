import type { Form3DData } from "./types"

const livingRoomExplore: Form3DData = {
  slug: "living-room",
  useCase: "explore",
  domain: "architecture",
  title: "Sala",
  modelFilename: "living_room.glb",
  overview:
    "Living room BIM export. Named groups live in living_room.parts.json: walls, slab, floor, windows, doors, sofa, table, TV.",
  unlabeledSummary:
    "Unlabeled mesh in the room. Teach from the architecture systems; do not invent a furniture brand or Object_N name.",
  meshIndex: {
    extras: [
      "Wall_",
      "Slab_",
      "Carpet_",
      "Window_",
      "Door_",
      "Sofa3x_",
      "Furniture_",
      "TV_set_",
      "Curtain_",
      "Fern_",
      "Linearsystem_",
    ],
    objectFrom: 1,
    objectTo: 0,
  },
  systems: [
    {
      id: "envelope",
      name: "Cerramiento",
      blurb: "Muros que cierran la sala y reciben huecos.",
    },
    {
      id: "structure",
      name: "Estructura",
      blurb: "Losa que sostiene el piso y las cargas de la estancia.",
    },
    {
      id: "openings",
      name: "Huecos",
      blurb: "Ventanas y puertas: luz, aire y circulación.",
    },
    {
      id: "furniture",
      name: "Mobiliario",
      blurb: "Sofá, mesa, sillas y televisión que organizan el estar.",
    },
    {
      id: "finish",
      name: "Acabados",
      blurb: "Alfombra y cortinas.",
    },
    {
      id: "services",
      name: "Instalaciones",
      blurb: "Iluminación de techo.",
    },
  ],
  parts: {
    Wall_: {
      label: "Muros",
      layer: "envelope",
      summary: "Muros que cierran la sala.",
    },
    Slab_: {
      label: "Losa",
      layer: "structure",
      summary: "Losa estructural bajo el piso.",
    },
    Carpet_: {
      label: "Alfombra",
      layer: "finish",
      summary: "Alfombra del estar.",
    },
    Window_: {
      label: "Ventanas",
      layer: "openings",
      summary: "Carpintería de ventana.",
    },
    Door_: {
      label: "Puertas",
      layer: "openings",
      summary: "Hojas y huecos de puerta.",
    },
    Sofa3x_: {
      label: "Sofá",
      layer: "furniture",
      summary: "Sofá de tres plazas.",
    },
    Furniture_: {
      label: "Mesa",
      layer: "furniture",
      summary: "Mesa de la sala.",
    },
    TV_set_: {
      label: "Televisión",
      layer: "furniture",
      summary: "Mueble y pantalla.",
    },
    Curtain_: {
      label: "Cortinas",
      layer: "finish",
      summary: "Textil frente a las ventanas.",
    },
    Fern_: {
      label: "Plantas",
      layer: "landscape",
      summary: "Vegetación de interior.",
    },
    Linearsystem_: {
      label: "Iluminación",
      layer: "services",
      summary: "Luminarias de techo.",
    },
  },
  activities: [
    {
      id: "locate-windows",
      kind: "select",
      targetLayer: "openings",
      prompt: "Click a window or door opening in the room.",
    },
    {
      id: "locate-sofa",
      kind: "select",
      targetLayer: "furniture",
      prompt: "Click the sofa or the table in the living area.",
    },
    {
      id: "explain-envelope",
      kind: "explain",
      prompt: "Click a wall and say how it closes the room and takes openings.",
    },
  ],
}

export default livingRoomExplore
