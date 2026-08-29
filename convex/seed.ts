import { v } from "convex/values"

import type { Id } from "./_generated/dataModel"
import type { MutationCtx } from "./_generated/server"
import { internalMutation } from "./_generated/server"
import { getFormBySlug, listFormParts } from "./forms/registry"
import { MOTO_ENGINE_SLUG } from "./lib/motoEngineSeed"

async function applyCuratedOverrides(
  ctx: MutationCtx,
  projectId: Id<"projects">,
  slug: string
) {
  const form = getFormBySlug(slug)
  if (!form) {
    return
  }

  for (const [gltfNodeName, curated] of Object.entries(form.parts)) {
    const row = await ctx.db
      .query("parts")
      .withIndex("by_project_and_node", (q) =>
        q.eq("projectId", projectId).eq("gltfNodeName", gltfNodeName)
      )
      .unique()

    if (!row) {
      continue
    }

    await ctx.db.patch(row._id, {
      label: curated.label,
      layer: curated.layer,
      summary: curated.summary,
      teachable: true,
    })
  }
}

export async function ensureFormCatalog(
  ctx: MutationCtx,
  slug: string
): Promise<Id<"projects"> | null> {
  const form = getFormBySlug(slug)
  if (!form) {
    return null
  }

  const existing = await ctx.db
    .query("projects")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique()

  if (existing) {
    await applyCuratedOverrides(ctx, existing._id, slug)
    return existing._id
  }

  const projectId = await ctx.db.insert("projects", {
    slug: form.slug,
    domain: form.domain,
    title: form.title,
    modelFilename: form.modelFilename,
    overview: form.overview,
  })

  for (const part of listFormParts(form)) {
    await ctx.db.insert("parts", {
      projectId,
      ...part,
    })
  }

  return projectId
}

export async function ensureMotoEngineCatalog(
  ctx: MutationCtx
): Promise<Id<"projects">> {
  const projectId = await ensureFormCatalog(ctx, MOTO_ENGINE_SLUG)
  if (!projectId) {
    throw new Error("Missing moto-engine form")
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
