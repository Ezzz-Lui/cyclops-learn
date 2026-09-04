"use client"

import { useAuth } from "@clerk/nextjs"
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react"
import { useLocale, useTranslations } from "next-intl"
import { useCallback, useEffect, useRef, useState } from "react"

import { ModelViewer } from "@/components/canvas/model-viewer"
import { PracticePanel, usePractice } from "@/components/canvas/practice-panel"
import { PlaceholderFrame } from "@/components/placeholders/placeholder-frame"
import { Button } from "@/components/ui/button"
import { Message, MessageContent, MessageHeader } from "@/components/ui/message"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { getForm, pickActivity } from "@/convex/forms/registry"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { isAppLocale } from "@/i18n/config"
import { getLocalizedCatalog, localizePart } from "@/lib/localize-catalog"
import { findPartById, findPartByNode, getPartCatalog } from "@/lib/part-catalog"

type CanvasWorkspaceProps = {
  projectSlug: string
  modelSrc: string
  modelFile: string
}

export function CanvasWorkspace({
  projectSlug,
  modelSrc,
  modelFile,
}: CanvasWorkspaceProps) {
  const { isSignedIn, getToken } = useAuth()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const t = useTranslations("Canvas")
  const locale = useLocale()
  const appLocale = isAppLocale(locale) ? locale : "es"
  const [authHint, setAuthHint] = useState<string | null>(null)
  const getOrCreate = useMutation(api.sessions.getOrCreate)
  const setSelection = useMutation(api.sessions.setSelection)
  const respond = useAction(api.agent.respond)
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickedPartId, setPickedPartId] = useState<string | null>(null)
  const [showObjectLabel, setShowObjectLabel] = useState(false)
  const [focusNonce, setFocusNonce] = useState(0)
  const [revealedPartId, setRevealedPartId] = useState<string | null>(null)
  const pendingSelection = useRef<Promise<unknown>>(Promise.resolve())

  const catalog = getLocalizedCatalog(getPartCatalog(modelFile), appLocale)

  const handleReveal = useCallback((partId: string | null) => {
    setRevealedPartId(partId)
    if (partId) {
      setFocusNonce((value) => value + 1)
    }
  }, [])

  const practice = usePractice({
    projectSlug,
    parts: catalog?.parts ?? [],
    onReveal: handleReveal,
  })
  const practiceActive = practice.active
  const practiceStop = practice.stop

  const session = useQuery(
    api.sessions.get,
    sessionId ? { sessionId } : "skip"
  )
  const messages = useQuery(
    api.chat.list,
    sessionId ? { sessionId } : "skip"
  )

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    let cancelled = false
    void getOrCreate({ projectSlug })
      .then((id) => {
        if (!cancelled) {
          setSessionId(id)
          setError(null)
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : t("sessionError"))
        }
      })

    return () => {
      cancelled = true
    }
  }, [getOrCreate, isAuthenticated, projectSlug, t])

  useEffect(() => {
    if (!isLoading) {
      setAuthHint(null)
      return
    }

    const timer = window.setTimeout(() => {
      void getToken({ template: "convex" })
        .then((token) => {
          setAuthHint(
            token ? t("authHintJwt") : t("authHintNoToken")
          )
        })
        .catch(() => {
          setAuthHint(t("authHintTemplate"))
        })
    }, 10000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [getToken, isLoading, t])

  async function handleSelectNode(gltfNodeName: string | null) {
    if (!sessionId) {
      return
    }
    const task = setSelection({ sessionId, gltfNodeName })
    pendingSelection.current = task
    await task
  }

  function handleIdentify(partId: string | null, gltfNodeName: string | null) {
    const part = partId ? findPartById(modelFile, partId) : null
    if (practiceActive) {
      practice.pick(partId)
      void handleSelectNode(part?.nodes[0] ?? gltfNodeName)
      return
    }
    setPickedPartId(partId)
    setShowObjectLabel(false)
    void handleSelectNode(part?.nodes[0] ?? gltfNodeName)
  }

  function handlePickFromList(partId: string) {
    const already = pickedPartId === partId && showObjectLabel
    const nextId = already ? null : partId
    setPickedPartId(nextId)
    setShowObjectLabel(Boolean(nextId))
    const part = nextId ? findPartById(modelFile, nextId) : null
    if (nextId) {
      setFocusNonce((value) => value + 1)
    }
    void handleSelectNode(part?.nodes[0] ?? null)
  }

  async function handleSend() {
    if (!sessionId || !draft.trim() || sending) {
      return
    }
    const text = draft
    setDraft("")
    setSending(true)
    setError(null)
    try {
      await pendingSelection.current
      await respond({ sessionId, text, locale: appLocale })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("agentError"))
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  const activePart = session?.activePart ?? null
  const catalogPartRaw =
    (pickedPartId ? findPartById(modelFile, pickedPartId) : null) ??
    (activePart ? findPartByNode(modelFile, activePart.gltfNodeName) : null)
  const catalogPart = catalogPartRaw
    ? localizePart(catalogPartRaw, appLocale)
    : null
  const activeLabel = catalogPart?.label ?? activePart?.label ?? null
  const form = session
    ? getForm(session.project.slug, session.useCase)
    : null
  const tryThis = form ? pickActivity(form, activePart) : null

  return (
    <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,10rem)_minmax(0,1fr)_minmax(14rem,16rem)] gap-4 lg:grid-cols-[14rem_minmax(0,1fr)_20rem] lg:grid-rows-none">
      <PlaceholderFrame
        label={practiceActive ? t("practice") : t("parts")}
        className="flex min-h-0 flex-col overflow-hidden"
      >
        {catalog ? (
          <div className="mb-3 shrink-0">
            <Button
              type="button"
              size="xs"
              variant={practiceActive ? "outline" : "default"}
              onClick={() => (practiceActive ? practice.stop() : practice.open())}
            >
              {practiceActive ? t("backToExplore") : t("startPractice")}
            </Button>
          </div>
        ) : null}
        {practiceActive && catalog ? (
          <PracticePanel practice={practice} parts={catalog.parts} />
        ) : (
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          {catalog ? (
            <ol className="space-y-1 text-sm">
              {catalog.parts.map((part) => {
                const selected = catalogPart?.id === part.id
                return (
                  <li key={part.id}>
                    <button
                      type="button"
                      onClick={() => handlePickFromList(part.id)}
                      className={
                        selected
                          ? "w-full rounded-lg bg-primary/15 px-2 py-1.5 text-left"
                          : "w-full rounded-lg px-2 py-1.5 text-left hover:bg-muted/60"
                      }
                    >
                      <p className="font-medium">
                        {part.diagramIndex != null ? `${part.diagramIndex}. ` : ""}
                        {part.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{part.summary}</p>
                    </button>
                  </li>
                )
              })}
            </ol>
          ) : activePart ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium">{activePart.label}</p>
              <p className="text-xs text-muted-foreground">
                {t("node", { name: activePart.gltfNodeName })}
              </p>
              <p className="text-muted-foreground">{activePart.summary}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("clickMesh")}</p>
          )}
          {tryThis ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {t("tryThis", { prompt: tryThis.prompt })}
            </p>
          ) : null}
        </div>
        )}
        <div className="mt-4 min-w-0 shrink-0 space-y-1 text-xs text-muted-foreground">
          <p>{t("file")}</p>
          <p className="truncate font-mono" title={modelFile}>
            {modelFile}
          </p>
          <p>{practiceActive ? t("modePractice") : t("modeExplore")}</p>
        </div>
      </PlaceholderFrame>

      <PlaceholderFrame
        label={t("viewer")}
        className="flex min-h-0 flex-col overflow-hidden"
      >
        <ModelViewer
          src={modelSrc}
          modelName={catalog?.title ?? session?.project.title ?? modelFile}
          selectedPartId={
            practiceActive
              ? revealedPartId
              : (pickedPartId ?? catalogPart?.id ?? null)
          }
          selectedLabel={practiceActive ? null : activeLabel}
          parts={catalog?.parts ?? []}
          showObjectLabel
          focusNonce={focusNonce}
          markerPartIds={
            practiceActive ? (revealedPartId ? [revealedPartId] : []) : null
          }
          className="min-h-0 flex-1"
          onIdentify={handleIdentify}
        />
      </PlaceholderFrame>

      <PlaceholderFrame
        label={t("chat")}
        className="flex min-h-0 flex-col overflow-hidden"
      >
        {isLoading ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Spinner className="size-4" />
              {t("connecting")}
            </div>
            {authHint ? <p className="text-xs text-destructive">{authHint}</p> : null}
          </div>
        ) : !isAuthenticated ? (
          <p className="text-sm text-muted-foreground">
            {isSignedIn ? t("signedInNoConvex") : t("signInToChat")}
          </p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {messages === undefined ? (
                <Spinner className="size-4" />
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("emptyChat")}</p>
              ) : (
                messages.map((message) => (
                  <Message
                    key={message._id}
                    align={message.role === "user" ? "end" : "start"}
                  >
                    <MessageContent>
                      <MessageHeader>
                        {message.role === "user" ? t("you") : t("agentName")}
                      </MessageHeader>
                      <p className="break-words rounded-xl bg-muted px-3 py-2 text-sm">
                        {message.text}
                      </p>
                    </MessageContent>
                  </Message>
                ))
              )}
            </div>
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : null}
            <div className="shrink-0 space-y-2">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t("placeholder")}
                rows={3}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void handleSend()
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                disabled={sending || !draft.trim() || !sessionId}
                onClick={() => void handleSend()}
              >
                {sending ? t("thinking") : t("send")}
              </Button>
            </div>
          </div>
        )}
      </PlaceholderFrame>
    </div>
  )
}
