"use client"

import { useAuth } from "@clerk/nextjs"
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react"
import { useEffect, useRef, useState } from "react"

import { ModelViewer } from "@/components/canvas/model-viewer"
import { PlaceholderFrame } from "@/components/placeholders/placeholder-frame"
import { Button } from "@/components/ui/button"
import { Message, MessageContent, MessageHeader } from "@/components/ui/message"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

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
  const { isSignedIn } = useAuth()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const getOrCreate = useMutation(api.sessions.getOrCreate)
  const setSelection = useMutation(api.sessions.setSelection)
  const respond = useAction(api.agent.respond)
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingSelection = useRef<Promise<unknown>>(Promise.resolve())

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
          setError(cause instanceof Error ? cause.message : "Could not open session")
        }
      })

    return () => {
      cancelled = true
    }
  }, [getOrCreate, isAuthenticated, projectSlug])

  async function handleSelectNode(gltfNodeName: string | null) {
    if (!sessionId) {
      return
    }
    const task = setSelection({ sessionId, gltfNodeName })
    pendingSelection.current = task
    await task
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
      await respond({ sessionId, text })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Agent failed")
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  const activePart = session?.activePart ?? null

  return (
    <div className="grid min-h-[32rem] flex-1 gap-4 lg:grid-cols-[14rem_minmax(0,1fr)_20rem]">
      <PlaceholderFrame label="Active part">
        {activePart ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium">{activePart.label}</p>
            <p className="text-xs text-muted-foreground">
              Node <code>{activePart.gltfNodeName}</code>
            </p>
            <p className="text-muted-foreground">{activePart.summary}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click a mesh on the engine. That selection is what the agent can
            talk about.
          </p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          File <code>{modelFile}</code> · mode explore
        </p>
      </PlaceholderFrame>

      <PlaceholderFrame label="3D viewer" className="flex min-h-72 flex-col">
        <ModelViewer
          src={modelSrc}
          modelName={session?.project.title ?? modelFile}
          selectedLabel={activePart?.label}
          className="min-h-72 flex-1"
          onSelectNode={(node) => {
            void handleSelectNode(node)
          }}
        />
      </PlaceholderFrame>

      <PlaceholderFrame label="Agent chat" className="flex min-h-56 flex-col">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            Connecting to the lab backend…
          </div>
        ) : !isAuthenticated ? (
          <p className="text-sm text-muted-foreground">
            {isSignedIn
              ? "Clerk session is up, Convex token is not. Refresh once so the lab backend can pick it up."
              : "Sign in to persist selection and talk to the lab instructor."}
          </p>
        ) : (
          <div className="flex h-full min-h-56 flex-col gap-3">
            <div className="min-h-40 flex-1 space-y-3 overflow-y-auto pr-1">
              {messages === undefined ? (
                <Spinner className="size-4" />
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ask what the selected mesh does. Without a click, I will send
                  you back to the canvas.
                </p>
              ) : (
                messages.map((message) => (
                  <Message
                    key={message._id}
                    align={message.role === "user" ? "end" : "start"}
                  >
                    <MessageContent>
                      <MessageHeader>
                        {message.role === "user" ? "You" : "Cyclops"}
                      </MessageHeader>
                      <p className="rounded-xl bg-muted px-3 py-2 text-sm">
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
            <div className="space-y-2">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about the selected part"
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
                {sending ? "Thinking…" : "Send"}
              </Button>
            </div>
          </div>
        )}
      </PlaceholderFrame>
    </div>
  )
}
