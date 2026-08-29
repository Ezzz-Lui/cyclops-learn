import { v } from "convex/values"

import type { Id } from "./_generated/dataModel"
import type { MutationCtx } from "./_generated/server"
import { internalMutation } from "./_generated/server"
import {
  CURATED_PARTS,
  MOTO_ENGINE_OVERVIEW,
  MOTO_ENGINE_SLUG,
  motoEngineParts,
} from "./lib/motoEngineSeed"

async function applyCuratedOverrides(
  ctx: MutationCtx,
  projectId: Id<"projects">
) {
  for (const [gltfNodeName, curated] of Object.entries(CURATED_PARTS)) {
    const part = await ctx.db
      .query("parts")
      .withIndex("by_project_and_node", (q) =>
        q.eq("projectId", projectId).eq("gltfNodeName", gltfNodeName)
      )
      .unique()

    if (!part) {
      continue
    }

    await ctx.db.patch(part._id, {
      label: curated.label,
      layer: curated.layer,
      summary: curated.summary,
      teachable: true,
    })
  }
}

export async function ensureMotoEngineCatalog(
  ctx: MutationCtx
): Promise<Id<"projects">> {
  const existing = await ctx.db
    .query("projects")
    .withIndex("by_slug", (q) => q.eq("slug", MOTO_ENGINE_SLUG))
    .unique()

  if (existing) {
    await applyCuratedOverrides(ctx, existing._id)
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
