import type { Form3DData } from "./types"

const bambooExplore: Form3DData = {
  slug: "bamboo",
  useCase: "explore",
  domain: "architecture",
  title: "Estructura de bambú",
  modelFilename: "bamboo_structural_system.glb",
  overview:
    "Bamboo pavilion from a Revit export. Families live in bamboo_structural_system.parts.json: columns, HSS tubes, floors, cob walls, glazed facade.",
  unlabeledSummary:
    "Unlabeled Revit instance. Teach from the structural systems; do not invent a specific family ID.",
  meshIndex: {
    extras: [
      "Round-Anglel-Column102",
      "Round-Anglel-Column 80",
      "HSS-Round Structural Tubing",
      "Floor 20",
      "Basic Wall Cob",
      "Basic Wall Base",
      "Railings",
      "System Panel Glazed",
      "Rectangular Mullion",
      "Round Column Tree",
    ],
    objectFrom: 1,
    objectTo: 0,
  },
  systems: [
    {
      id: "structure",
      name: "Estructura",
      blurb: "Columnas, tubos HSS y pisos que bajan y reparte la carga.",
    },
    {
      id: "envelope",
      name: "Cerramiento",
      blurb: "Muros de cob, zócalo y fachada de vidrio.",
    },
    {
      id: "protection",
      name: "Protección",
      blurb: "Barandillas en bordes de piso.",
    },
  ],
  parts: {
    "Round-Anglel-Column102": {
      label: "Columnas principales",
      layer: "structure",
      summary: "Pilares redondos Ø102/130.",
    },
    "Round-Anglel-Column 80": {
      label: "Columnas menores",
      layer: "structure",
      summary: "Pilares 80×80.",
    },
    "HSS-Round Structural Tubing": {
      label: "Tubos HSS",
      layer: "structure",
      summary: "Vigas y riostras tubulares.",
    },
    "Floor 20": {
      label: "Pisos",
      layer: "structure",
      summary: "Losas y entrepisos.",
    },
    "Basic Wall Cob": {
      label: "Muros de cob",
      layer: "envelope",
      summary: "Muros de tierra/cob.",
    },
    "Basic Wall Base": {
      label: "Muros base",
      layer: "envelope",
      summary: "Zócalo o muro base.",
    },
    Railings: {
      label: "Barandillas",
      layer: "protection",
      summary: "Barandales de borde.",
    },
    "System Panel Glazed": {
      label: "Fachada acristalada",
      layer: "envelope",
      summary: "Paneles de vidrio.",
    },
    "Rectangular Mullion": {
      label: "Montantes",
      layer: "envelope",
      summary: "Montantes del muro cortina.",
    },
    "Round Column Tree": {
      label: "Columnas árbol",
      layer: "structure",
      summary: "Columnas ramificadas.",
    },
  },
  activities: [
    {
      id: "locate-columns",
      kind: "select",
      targetLayer: "structure",
      prompt: "Click a primary column or an HSS tube.",
    },
    {
      id: "locate-cob",
      kind: "select",
      targetLayer: "envelope",
      prompt: "Click a cob wall or the glazed facade.",
    },
    {
      id: "explain-load",
      kind: "explain",
      prompt: "Click a floor or column and say how load travels down.",
    },
  ],
}

export default bambooExplore
