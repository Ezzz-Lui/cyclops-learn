import type { Doc } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"

export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await getCurrentUserOrNull(ctx)
  if (!user) {
    throw new Error("Not authenticated")
  }
  return user
}

export async function getCurrentUserOrNull(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    return null
  }

  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique()
}

export async function upsertCurrentUser(ctx: MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error("Not authenticated")
  }

  const existing = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique()

  const name = identity.name ?? identity.givenName ?? "Student"
  const email = identity.email ?? ""

  if (existing) {
    await ctx.db.patch(existing._id, { name, email })
    const updated = await ctx.db.get(existing._id)
    if (!updated) {
      throw new Error("User not found")
    }
    return updated
  }

  const userId = await ctx.db.insert("users", {
    tokenIdentifier: identity.tokenIdentifier,
    name,
    email,
  })
  const created = await ctx.db.get(userId)
  if (!created) {
    throw new Error("User not found")
  }
  return created
}
