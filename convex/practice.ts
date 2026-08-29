import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { getCurrentUser, getCurrentUserOrNull } from "./lib/auth"

export const recordResult = mutation({
  args: {
    projectSlug: v.string(),
    partId: v.string(),
    correct: v.boolean(),
    clicks: v.number(),
    hintsUsed: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    await ctx.db.insert("practiceAttempts", {
      userId: user._id,
      projectSlug: args.projectSlug,
      partId: args.partId,
      correct: args.correct,
      clicks: args.clicks,
      hintsUsed: args.hintsUsed,
      createdAt: Date.now(),
    })
    return null
  },
})

/** Per-part aggregate for the current user, used to order the next round. */
export const stats = query({
  args: { projectSlug: v.string() },
  returns: v.array(
    v.object({
      partId: v.string(),
      total: v.number(),
      correct: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx)
    if (!user) {
      return []
    }

    const rows = await ctx.db
      .query("practiceAttempts")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userId", user._id).eq("projectSlug", args.projectSlug)
      )
      .collect()

    const byPart = new Map<string, { total: number; correct: number }>()
    for (const row of rows) {
      const entry = byPart.get(row.partId) ?? { total: 0, correct: 0 }
      entry.total += 1
      if (row.correct) {
        entry.correct += 1
      }
      byPart.set(row.partId, entry)
    }

    return [...byPart.entries()].map(([partId, entry]) => ({
      partId,
      total: entry.total,
      correct: entry.correct,
    }))
  },
})
