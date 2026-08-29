export type FormDomain = "architecture" | "mechanics" | "computing"
export type FormUseCase = "explore" | "faults" | "diagnosis"
export type FormActivityKind = "select" | "compare" | "explain" | "locate"

export type FormSystem = {
  id: string
  name: string
  blurb: string
}

export type FormActivity = {
  id: string
  kind: FormActivityKind
  prompt: string
  targetLayer?: string
  targetNode?: string
}

export type FormPart = {
  label: string
  layer: string
  summary: string
  interactions?: FormActivity[]
}

export type FormMeshIndex = {
  extras: string[]
  objectFrom: number
  objectTo: number
}

export type Form3DData = {
  slug: string
  useCase: FormUseCase
  domain: FormDomain
  title: string
  modelFilename: string
  overview: string
  unlabeledSummary: string
  meshIndex: FormMeshIndex
  systems: FormSystem[]
  parts: Record<string, FormPart>
  activities: FormActivity[]
}

export function expandMeshIndex(index: FormMeshIndex) {
  const nodes = [...index.extras]
  for (let n = index.objectFrom; n <= index.objectTo; n += 1) {
    nodes.push(`Object_${n}`)
  }
  return nodes
}

export function humanizeNode(name: string) {
  return name.replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim() || name
}
