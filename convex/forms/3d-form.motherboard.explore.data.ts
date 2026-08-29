import type { Form3DData } from "./types"

const motherboardExplore: Form3DData = {
  slug: "motherboard",
  useCase: "explore",
  domain: "computing",
  title: "Placa base",
  modelFilename: "motherboard__components.glb",
  overview:
    "ATX motherboard. Named groups live in motherboard__components.parts.json: placa, CPU, RAM, M.2, pila CMOS, I/O.",
  unlabeledSummary:
    "Unlabeled mesh on the board. Teach from the motherboard systems; do not invent a chip name.",
  meshIndex: {
    extras: ["MotherBoard", "CPU", "M2", "RAM", "RAM1", "RAM2", "RAM3", "Battery"],
    objectFrom: 1,
    objectTo: 0,
  },
  systems: [
    {
      id: "board",
      name: "Placa base",
      blurb: "PCB que interconecta CPU, memoria, almacenamiento y puertos.",
    },
    {
      id: "cpu",
      name: "Procesador",
      blurb: "CPU en el socket. Ejecuta el software; el retenedor la fija.",
    },
    {
      id: "memory",
      name: "Memoria RAM",
      blurb: "Módulos DIMM. Memoria de trabajo volátil.",
    },
    {
      id: "storage",
      name: "Almacenamiento M.2",
      blurb: "SSD en ranura M.2, pegado a la placa.",
    },
    {
      id: "power",
      name: "Pila CMOS",
      blurb: "Mantiene reloj y setup del firmware sin corriente de la PSU.",
    },
    {
      id: "io",
      name: "Panel I/O",
      blurb: "USB, vídeo, audio y antenas hacia el exterior del gabinete.",
    },
  ],
  parts: {
    CPU: {
      label: "Procesador (CPU)",
      layer: "cpu",
      summary: "Unidad central de proceso en el socket.",
    },
    M2: {
      label: "SSD M.2",
      layer: "storage",
      summary: "Unidad de estado sólido en ranura M.2.",
    },
    RAM: {
      label: "Memoria RAM",
      layer: "memory",
      summary: "Módulo DIMM de memoria de trabajo.",
    },
    RAM1: {
      label: "Memoria RAM",
      layer: "memory",
      summary: "Módulo DIMM de memoria de trabajo.",
    },
    RAM2: {
      label: "Memoria RAM",
      layer: "memory",
      summary: "Módulo DIMM de memoria de trabajo.",
    },
    RAM3: {
      label: "Memoria RAM",
      layer: "memory",
      summary: "Módulo DIMM de memoria de trabajo.",
    },
    Battery: {
      label: "Pila CMOS",
      layer: "power",
      summary: "Batería que sostiene el reloj y la CMOS.",
    },
    MotherBoard: {
      label: "Placa base",
      layer: "board",
      summary: "PCB principal del sistema.",
    },
  },
  activities: [
    {
      id: "locate-cpu",
      kind: "select",
      targetLayer: "cpu",
      prompt: "Click the CPU on the socket.",
    },
    {
      id: "locate-ram",
      kind: "select",
      targetLayer: "memory",
      prompt: "Click a RAM stick in the DIMM slots.",
    },
    {
      id: "explain-io",
      kind: "explain",
      prompt: "Click a port on the I/O panel and say what you think it connects to.",
    },
  ],
}

export default motherboardExplore
