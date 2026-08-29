import { v } from "convex/values"

import {
  domainValidator,
  messageRoleValidator,
  useCaseValidator,
} from "../schema"

export const partReturn = v.object({
  _id: v.id("parts"),
  gltfNodeName: v.string(),
  label: v.string(),
  layer: v.optional(v.string()),
  summary: v.string(),
  teachable: v.boolean(),
})

export const projectReturn = v.object({
  _id: v.id("projects"),
  slug: v.string(),
  domain: domainValidator,
  title: v.string(),
  modelFilename: v.string(),
  overview: v.string(),
})

export const sessionReturn = v.object({
  _id: v.id("sessions"),
  useCase: useCaseValidator,
  project: projectReturn,
  activePart: v.union(partReturn, v.null()),
})

export const messageReturn = v.object({
  _id: v.id("messages"),
  role: messageRoleValidator,
  text: v.string(),
  partId: v.optional(v.id("parts")),
  createdAt: v.number(),
})
