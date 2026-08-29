import { v } from "convex/values"

import type { Id } from "./_generated/dataModel"
import type { MutationCtx } from "./_generated/server"
import { internalMutation } from "./_generated/server"
import {
  MOTO_ENGINE_OVERVIEW,
  MOTO_ENGINE_SLUG,
  motoEngineParts,
} from "./lib/motoEngineSeed"

export async function ensureMotoEngineCatalog(
  ctx: MutationCtx
): Promise<Id<"projects">> {
  const existing = await ctx.db
    .query("projects")
    .withIndex("by_slug", (q) => q.eq("slug", MOTO_ENGINE_SLUG))
    .unique()

  if (existing) {
    return existing._id
  }

  const projectId = await ctx.db.insert("projects", {
    slug: MOTO_ENGINE_SLUG,
    domain: "mechanics",
    title: "Motorcycle ICE",
    modelFilename: "internal_combustion_engine_moto.glb",
    overview: MOTO_ENGINE_OVERVIEW,
  })

  for (const part of motoEngineParts()) {
    await ctx.db.insert("parts", {
      projectId,
      ...part,
    })
  }

  return projectId
}

export const ensureMotoEngine = internalMutation({
  args: {},
  returns: v.id("projects"),
  handler: async (ctx) => {
    return await ensureMotoEngineCatalog(ctx)
  },
})
