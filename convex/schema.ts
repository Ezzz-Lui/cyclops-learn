import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const domainValidator = v.union(
  v.literal("architecture"),
  v.literal("mechanics"),
  v.literal("computing")
)

export const useCaseValidator = v.union(
  v.literal("explore"),
  v.literal("faults"),
  v.literal("diagnosis")
)

export const messageRoleValidator = v.union(
  v.literal("user"),
  v.literal("assistant")
)

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  projects: defineTable({
    slug: v.string(),
    domain: domainValidator,
    title: v.string(),
    modelFilename: v.string(),
    overview: v.string(),
  }).index("by_slug", ["slug"]),

  parts: defineTable({
    projectId: v.id("projects"),
    gltfNodeName: v.string(),
    label: v.string(),
    layer: v.optional(v.string()),
    summary: v.string(),
    teachable: v.boolean(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_node", ["projectId", "gltfNodeName"]),

  sessions: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    useCase: useCaseValidator,
    activePartId: v.optional(v.id("parts")),
  }).index("by_user_and_project", ["userId", "projectId"]),

  messages: defineTable({
    sessionId: v.id("sessions"),
    role: messageRoleValidator,
    text: v.string(),
    partId: v.optional(v.id("parts")),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  // One row per practice target completed. partId is the catalog part id
  // (string from *.parts.json), not a Convex parts row.
  practiceAttempts: defineTable({
    userId: v.id("users"),
    projectSlug: v.string(),
    partId: v.string(),
    correct: v.boolean(),
    clicks: v.number(),
    hintsUsed: v.number(),
    createdAt: v.number(),
  }).index("by_user_and_project", ["userId", "projectSlug"]),
})
