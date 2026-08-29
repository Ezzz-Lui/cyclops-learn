import { v } from "convex/values"

import type { Doc } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import { mutation, query } from "./_generated/server"
import { getCurrentUser, upsertCurrentUser } from "./lib/auth"
import { partReturn, sessionReturn } from "./lib/validators"
import { ensureMotoEngineCatalog } from "./seed"

async function loadSessionView(
  ctx: QueryCtx | MutationCtx,
  session: Doc<"sessions">
) {
  const project = await ctx.db.get(session.projectId)
  if (!project) {
    throw new Error("Project not found")
  }

  const activePart = session.activePartId
    ? await ctx.db.get(session.activePartId)
    : null

  return {
    _id: session._id,
    useCase: session.useCase,
    project: {
      _id: project._id,
      slug: project.slug,
      domain: project.domain,
      title: project.title,
      modelFilename: project.modelFilename,
      overview: project.overview,
    },
    activePart: activePart
      ? {
          _id: activePart._id,
          gltfNodeName: activePart.gltfNodeName,
          label: activePart.label,
          layer: activePart.layer,
          summary: activePart.summary,
          teachable: activePart.teachable,
        }
      : null,
  }
}

export const getOrCreate = mutation({
  args: { projectSlug: v.string() },
  returns: v.id("sessions"),
  handler: async (ctx, args) => {
    const user = await upsertCurrentUser(ctx)
    const fallbackProjectId = await ensureMotoEngineCatalog(ctx)

    const requested = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.projectSlug))
      .unique()

    const project = requested ?? (await ctx.db.get(fallbackProjectId))
    if (!project) {
      throw new Error("Project not found")
    }

    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userId", user._id).eq("projectId", project._id)
      )
      .unique()

    if (existing) {
      return existing._id
    }

    return await ctx.db.insert("sessions", {
      userId: user._id,
      projectId: project._id,
      useCase: "explore",
    })
  },
})

export const get = query({
  args: { sessionId: v.id("sessions") },
  returns: v.union(sessionReturn, v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const session = await ctx.db.get(args.sessionId)
    if (!session || session.userId !== user._id) {
      return null
    }
    return await loadSessionView(ctx, session)
  },
})

export const setSelection = mutation({
  args: {
    sessionId: v.id("sessions"),
    gltfNodeName: v.union(v.string(), v.null()),
  },
  returns: v.union(partReturn, v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const session = await ctx.db.get(args.sessionId)
    if (!session || session.userId !== user._id) {
      throw new Error("Session not found")
    }

    if (args.gltfNodeName === null) {
      await ctx.db.patch(args.sessionId, { activePartId: undefined })
      return null
    }

    const gltfNodeName = args.gltfNodeName
    const part = await ctx.db
      .query("parts")
      .withIndex("by_project_and_node", (q) =>
        q.eq("projectId", session.projectId).eq("gltfNodeName", gltfNodeName)
      )
      .unique()

    await ctx.db.patch(args.sessionId, {
      activePartId: part?._id,
    })

    if (!part) {
      return null
    }

    return {
      _id: part._id,
      gltfNodeName: part.gltfNodeName,
      label: part.label,
      layer: part.layer,
      summary: part.summary,
      teachable: part.teachable,
    }
  },
})
