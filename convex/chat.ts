import { v } from "convex/values"

import { internalMutation, internalQuery, query } from "./_generated/server"
import { getCurrentUser } from "./lib/auth"
import { messageReturn } from "./lib/validators"

const MESSAGE_PAGE = 50

export const list = query({
  args: { sessionId: v.id("sessions") },
  returns: v.array(messageReturn),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const session = await ctx.db.get(args.sessionId)
    if (!session || session.userId !== user._id) {
      return []
    }

    const recent = await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(MESSAGE_PAGE)

    return recent.reverse().map((message) => ({
      _id: message._id,
      role: message.role,
      text: message.text,
      partId: message.partId,
      createdAt: message.createdAt,
    }))
  },
})

export const getSnapshot = internalQuery({
  args: { sessionId: v.id("sessions") },
  returns: v.object({
    userId: v.id("users"),
    tokenIdentifier: v.string(),
    useCase: v.union(
      v.literal("explore"),
      v.literal("faults"),
      v.literal("diagnosis")
    ),
    projectSlug: v.string(),
    projectOverview: v.string(),
    projectTitle: v.string(),
    activePart: v.union(
      v.object({
        _id: v.id("parts"),
        label: v.string(),
        gltfNodeName: v.string(),
        layer: v.optional(v.string()),
        summary: v.string(),
        teachable: v.boolean(),
      }),
      v.null()
    ),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        text: v.string(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) {
      throw new Error("Session not found")
    }

    const user = await ctx.db.get(session.userId)
    const project = await ctx.db.get(session.projectId)
    if (!user || !project) {
      throw new Error("Session owner or project not found")
    }

    const activePart = session.activePartId
      ? await ctx.db.get(session.activePartId)
      : null

    const recent = await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(20)

    return {
      userId: session.userId,
      tokenIdentifier: user.tokenIdentifier,
      useCase: session.useCase,
      projectSlug: project.slug,
      projectOverview: project.overview,
      projectTitle: project.title,
      activePart: activePart
        ? {
            _id: activePart._id,
            label: activePart.label,
            gltfNodeName: activePart.gltfNodeName,
            layer: activePart.layer,
            summary: activePart.summary,
            teachable: activePart.teachable,
          }
        : null,
      messages: recent.reverse().map((message) => ({
        role: message.role,
        text: message.text,
      })),
    }
  },
})

export const appendMessage = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) {
      throw new Error("Session not found")
    }

    return await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      role: args.role,
      text: args.text,
      partId: session.activePartId,
      createdAt: Date.now(),
    })
  },
})
