"use node"

import { v } from "convex/values"

import { internal } from "./_generated/api"
import { action } from "./_generated/server"
import { getForm, pickActivity } from "./forms/registry"
import { localeValidator } from "./lib/validators"
import type { FormUseCase } from "./forms/types"

type AppLocale = "es" | "en" | "zh"

type Snapshot = {
  userId: string
  tokenIdentifier: string
  useCase: FormUseCase
  projectSlug: string
  projectOverview: string
  projectTitle: string
  activePart: {
    _id: string
    label: string
    gltfNodeName: string
    layer?: string
    summary: string
    teachable: boolean
  } | null
  messages: Array<{ role: "user" | "assistant"; text: string }>
}

function systemPrimer(snapshot: Snapshot) {
  const form = getForm(snapshot.projectSlug, snapshot.useCase)
  const systems = form?.systems ?? []
  return systems.map((system) => `- ${system.name}: ${system.blurb}`).join("\n")
}

function nextMove(snapshot: Snapshot) {
  const form = getForm(snapshot.projectSlug, snapshot.useCase)
  if (!form) {
    return null
  }
  return pickActivity(form, snapshot.activePart)
}

function languageRule(locale: AppLocale) {
  if (locale === "en") {
    return "Reply in English. Keep a lab-instructor tone. Translate part names for the student."
  }
  if (locale === "zh") {
    return "用简体中文回答。保持实验室导师的语气。把零件名称翻译成学生界面上的中文。"
  }
  return "Responde en español latinoamericano, de tú. Mantén tono de instructor de lab. Usa los nombres de pieza que ve el estudiante."
}

function buildSystemPrompt(snapshot: Snapshot, locale: AppLocale) {
  const activity = nextMove(snapshot)
  const activityBlock = activity
    ? `Learning-by-doing (propose at most one, as a concrete canvas action):\n- ${activity.prompt}`
    : ""

  if (!snapshot.activePart) {
    return `You are Cyclops, a lab instructor for ${snapshot.projectTitle}.
Mode: ${snapshot.useCase}.
No mesh is selected on the canvas.
${languageRule(locale)}

Rules:
- Ask the student to click a mesh. Do not invent a specific part.
- You cannot see the 3D pixels.
${activityBlock}`
  }

  const part = snapshot.activePart
  const curatedLine = part.teachable
    ? `This mesh is curated. Teach from the part notes.`
    : `This mesh is unlabeled (Sketchfab name only). That still counts as a selection. Acknowledge the node, say it is not curated, then teach from ICE systems. Never ask them to click again.`

  return `You are Cyclops, a lab instructor for ${snapshot.projectTitle}.
Mode: ${snapshot.useCase}.
Object notes: ${snapshot.projectOverview}
${languageRule(locale)}

AUTHORITATIVE CANVAS SELECTION:
- Label: ${part.label}
- Node: ${part.gltfNodeName}
- Layer: ${part.layer ?? "assembly"}
- ${curatedLine}
- Notes: ${part.summary}

ICE systems (use these when the mesh is unlabeled):
${systemPrimer(snapshot)}

${activityBlock}

Rules:
- The student already selected the mesh above. Do not say nothing is selected.
- Do not invent a specific name for an unlabeled Object_N mesh.
- End with one canvas action from the learning-by-doing line when it fits.
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

function fallbackReply(snapshot: Snapshot, text: string, locale: AppLocale) {
  if (locale === "zh") {
    if (!snapshot.activePart) {
      return "先在模型上点选一个网格。我只根据你在画布上点到的零件来回答。"
    }
    if (!snapshot.activePart.teachable) {
      return `${snapshot.activePart.label} 是未编目网格（${snapshot.activePart.gltfNodeName}）。${snapshot.projectOverview} 可以问某个系统，或再点另一个零件。`
    }
    return `${snapshot.activePart.label}：${snapshot.activePart.summary} 你问的是：“${text}”`
  }

  if (locale === "en") {
    if (!snapshot.activePart) {
      return "Select a mesh on the model first. I only answer from the part you click on the canvas."
    }
    if (!snapshot.activePart.teachable) {
      return `${snapshot.activePart.label} is an unlabeled mesh (${snapshot.activePart.gltfNodeName}). ${snapshot.projectOverview} Ask about a system or click another part.`
    }
    return `${snapshot.activePart.label}: ${snapshot.activePart.summary} You asked: "${text}"`
  }

  if (!snapshot.activePart) {
    return "Selecciona un mesh en el modelo primero. Solo respondo desde la pieza que haces clic en el canvas."
  }

  if (!snapshot.activePart.teachable) {
    return `${snapshot.activePart.label} es un mesh sin curar (${snapshot.activePart.gltfNodeName}). ${snapshot.projectOverview} Pregunta por un sistema o haz clic en otra pieza.`
  }

  return `${snapshot.activePart.label}: ${snapshot.activePart.summary} Preguntaste: "${text}"`
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
    locale: v.optional(localeValidator),
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

    const locale = args.locale ?? "es"
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

    const system = buildSystemPrompt(snapshot, locale)
    const prior = snapshot.activePart
      ? snapshot.messages.slice(-6)
      : snapshot.messages
    const history = [
      ...prior,
      { role: "user" as const, text: bindUserText(snapshot, trimmed) },
    ]
    const modelReply = await callOpenAi(system, history)
    const reply = modelReply ?? fallbackReply(snapshot, trimmed, locale)

    await ctx.runMutation(internal.chat.appendMessage, {
      sessionId: args.sessionId,
      role: "assistant",
      text: reply,
    })

    return null
  },
})
