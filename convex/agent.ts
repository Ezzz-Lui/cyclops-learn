"use node"

import { v } from "convex/values"

import { internal } from "./_generated/api"
import { action } from "./_generated/server"
import { ICE_SYSTEMS } from "./lib/motoEngineSeed"

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

function systemPrimer() {
  return ICE_SYSTEMS.map((system) => `- ${system.name}: ${system.blurb}`).join(
    "\n"
  )
}

function buildSystemPrompt(snapshot: Snapshot) {
  if (!snapshot.activePart) {
    return `You are Cyclops, a lab instructor for ${snapshot.projectTitle}.
Mode: ${snapshot.useCase}.
No mesh is selected on the canvas.

Rules:
- Ask the student to click a mesh. Do not invent a specific part.
- You cannot see the 3D pixels.`
  }

  const part = snapshot.activePart
  const curatedLine = part.teachable
    ? `This mesh is curated. Teach from the part notes.`
    : `This mesh is unlabeled (Sketchfab name only). That still counts as a selection. Acknowledge the node, say it is not curated, then teach from ICE systems. Never ask them to click again.`

  return `You are Cyclops, a lab instructor for ${snapshot.projectTitle}.
Mode: ${snapshot.useCase}.
Object notes: ${snapshot.projectOverview}

AUTHORITATIVE CANVAS SELECTION:
- Label: ${part.label}
- Node: ${part.gltfNodeName}
- ${curatedLine}
- Notes: ${part.summary}

ICE systems (use these when the mesh is unlabeled):
${systemPrimer()}

Rules:
- The student already selected the mesh above. Do not say nothing is selected.
- Do not invent a specific name for an unlabeled Object_N mesh.
- Keep it short. You cannot see the 3D pixels.`
}

function bindUserText(snapshot: Snapshot, text: string) {
  if (!snapshot.activePart) {
    return `[Canvas: no mesh selected]\n${text}`
  }
  const part = snapshot.activePart
  const tag = part.teachable ? "curated" : "unlabeled"
  return `[Canvas selection: ${part.label} / ${part.gltfNodeName} / ${tag}]\n${text}`
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
    const prior = snapshot.activePart
      ? snapshot.messages.slice(-6)
      : snapshot.messages
    const history = [
      ...prior,
      { role: "user" as const, text: bindUserText(snapshot, trimmed) },
    ]
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
