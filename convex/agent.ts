"use node"

import { v } from "convex/values"

import { internal } from "./_generated/api"
import { action } from "./_generated/server"

type Snapshot = {
  userId: string
  tokenIdentifier: string
  useCase: "explore" | "faults" | "diagnosis"
  projectOverview: string
  projectTitle: string
  activePart: {
    _id: string
    label: string
    gltfNodeName: string
    summary: string
    teachable: boolean
  } | null
  messages: Array<{ role: "user" | "assistant"; text: string }>
}

function buildSystemPrompt(snapshot: Snapshot) {
  const partBlock = snapshot.activePart
    ? `Active part: ${snapshot.activePart.label} (node ${snapshot.activePart.gltfNodeName}).
Teachable: ${snapshot.activePart.teachable ? "yes" : "no"}.
Part notes: ${snapshot.activePart.summary}`
    : "Active part: none. Ask the student to click a mesh on the 3D canvas before explaining a specific part."

  return `You are Cyclops, a lab instructor for ${snapshot.projectTitle}.
Mode: ${snapshot.useCase}.
Object notes: ${snapshot.projectOverview}
${partBlock}

Rules:
- Talk about the selected mesh and the motorcycle ICE, not generic engines.
- If no part is selected, do not invent a part. Send them back to the canvas.
- If the part is not curated, say so and teach nearby ICE systems (cooling, cylinder, intake, exhaust).
- In explore mode, explain function and location. Keep it short.
- Never claim you can see the 3D pixels. You only know the selected node and catalog text.`
}

function fallbackReply(snapshot: Snapshot, text: string) {
  if (!snapshot.activePart) {
    return "Select a mesh on the engine first. I only answer from the part you click on the canvas."
  }

  if (!snapshot.activePart.teachable) {
    return `${snapshot.activePart.label} is an unlabeled mesh (${snapshot.activePart.gltfNodeName}) in this ICE. ${snapshot.projectOverview} Ask about a system — cooling, cylinder, intake, exhaust — or click another part.`
  }

  return `${snapshot.activePart.label}: ${snapshot.activePart.summary} You asked: "${text}"`
}

async function callOpenAi(system: string, messages: Snapshot["messages"]) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return null
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        ...messages.map((message) => ({
          role: message.role,
          content: message.text,
        })),
      ],
    }),
  })

  if (!response.ok) {
    console.error("OpenAI request failed", response.status)
    return null
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content ?? null
}

export const respond = action({
  args: {
    sessionId: v.id("sessions"),
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const trimmed = args.text.trim()
    if (!trimmed) {
      throw new Error("Message cannot be empty")
    }

    const snapshot = (await ctx.runQuery(internal.chat.getSnapshot, {
      sessionId: args.sessionId,
    })) as Snapshot

    if (snapshot.tokenIdentifier !== identity.tokenIdentifier) {
      throw new Error("Unauthorized")
    }

    await ctx.runMutation(internal.chat.appendMessage, {
      sessionId: args.sessionId,
      role: "user",
      text: trimmed,
    })

    const system = buildSystemPrompt(snapshot)
    const history = [...snapshot.messages, { role: "user" as const, text: trimmed }]
    const modelReply = await callOpenAi(system, history)
    const reply = modelReply ?? fallbackReply(snapshot, trimmed)

    await ctx.runMutation(internal.chat.appendMessage, {
      sessionId: args.sessionId,
      role: "assistant",
      text: reply,
    })

    return null
  },
})
