"use client"

import { useMutation, useQuery } from "convex/react"
import { useCallback, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import type { PartCatalogEntry } from "@/lib/part-catalog"
import { cn } from "@/lib/utils"

const REVEAL_AFTER_MISSES = 3

type Feedback = {
  tone: "ok" | "miss" | "help"
  text: string
}

type TargetResult = {
  partId: string
  solved: boolean
  clicks: number
  hintsUsed: number
}

type PracticeState = {
  phase: "idle" | "intro" | "run" | "done"
  queue: string[]
  index: number
  misses: number
  hintLevel: 0 | 1 | 2
  feedback: Feedback | null
  /** Current target answered (right, or given up); waiting for "next". */
  settled: boolean
  results: TargetResult[]
}

const IDLE: PracticeState = {
  phase: "idle",
  queue: [],
  index: 0,
  misses: 0,
  hintLevel: 0,
  feedback: null,
  settled: false,
  results: [],
}

type PartStats = { partId: string; total: number; correct: number }

/**
 * Hardest parts first: previously failed ones open the round, unseen ones
 * follow, mastered ones close it.
 */
function buildQueue(parts: PartCatalogEntry[], stats: PartStats[]) {
  const byId = new Map(stats.map((row) => [row.partId, row]))
  const priority = (part: PartCatalogEntry) => {
    const row = byId.get(part.id)
    if (!row || row.total === 0) return 1
    const failRate = 1 - row.correct / row.total
    return failRate > 0 ? 2 + failRate : 0
  }
  return [...parts].sort((a, b) => priority(b) - priority(a)).map((p) => p.id)
}

export function usePractice({
  projectSlug,
  parts,
  onReveal,
}: {
  projectSlug: string
  parts: PartCatalogEntry[]
  onReveal: (partId: string | null) => void
}) {
  const [state, setState] = useState<PracticeState>(IDLE)
  const stateRef = useRef(state)
  stateRef.current = state

  // Only query once practice opens, so explore mode never depends on the
  // practice functions being deployed.
  const stats = useQuery(
    api.practice.stats,
    state.phase === "idle" ? "skip" : { projectSlug }
  )
  const recordResult = useMutation(api.practice.recordResult)

  const partsById = useMemo(
    () => new Map(parts.map((part) => [part.id, part])),
    [parts]
  )

  const apply = useCallback((next: PracticeState) => {
    stateRef.current = next
    setState(next)
  }, [])

  const persist = useCallback(
    (result: TargetResult) => {
      void recordResult({
        projectSlug,
        partId: result.partId,
        correct: result.solved,
        clicks: result.clicks,
        hintsUsed: result.hintsUsed,
      }).catch(() => {
        // Practice keeps working offline; history just will not update.
      })
    },
    [projectSlug, recordResult]
  )

  const open = useCallback(() => {
    onReveal(null)
    apply({ ...IDLE, phase: "intro" })
  }, [apply, onReveal])

  const stop = useCallback(() => {
    onReveal(null)
    apply(IDLE)
  }, [apply, onReveal])

  const startWith = useCallback(
    (queue: string[]) => {
      if (queue.length === 0) return
      onReveal(null)
      apply({ ...IDLE, phase: "run", queue })
    },
    [apply, onReveal]
  )

  const start = useCallback(() => {
    startWith(buildQueue(parts, stats ?? []))
  }, [parts, startWith, stats])

  const settle = useCallback(
    (solved: boolean, feedback: Feedback) => {
      const s = stateRef.current
      const targetId = s.queue[s.index]
      const result: TargetResult = {
        partId: targetId,
        solved,
        clicks: s.misses + 1,
        hintsUsed: s.hintLevel,
      }
      persist(result)
      onReveal(targetId)
      apply({
        ...s,
        settled: true,
        feedback,
        results: [...s.results, result],
      })
    },
    [apply, onReveal, persist]
  )

  const pick = useCallback(
    (partId: string | null) => {
      const s = stateRef.current
      if (s.phase !== "run" || s.settled) return

      const targetId = s.queue[s.index]
      const target = partsById.get(targetId)
      if (!target) return

      if (partId === targetId) {
        const clean = s.misses === 0 && s.hintLevel === 0
        settle(s.hintLevel < 2, {
          tone: s.hintLevel < 2 ? "ok" : "help",
          text: clean
            ? `Correcto a la primera. ${target.summary}`
            : s.hintLevel < 2
              ? `Correcto. ${target.summary}`
              : `La encontraste con la etiqueta visible. ${target.summary}`,
        })
        return
      }

      const clicked = partId ? partsById.get(partId) : null
      const misses = s.misses + 1
      const hintLevel: 0 | 1 | 2 =
        misses >= REVEAL_AFTER_MISSES ? 2 : misses >= 1 ? 1 : 0
      if (hintLevel === 2 && s.hintLevel < 2) {
        onReveal(targetId)
      }
      apply({
        ...s,
        misses,
        hintLevel,
        feedback: {
          tone: "miss",
          text: clicked
            ? `Eso es ${clicked.label}, no ${target.label}.`
            : `Ahí no hay nada catalogado. Busca ${target.label}.`,
        },
      })
    },
    [apply, onReveal, partsById, settle]
  )

  const requestHint = useCallback(() => {
    const s = stateRef.current
    if (s.phase !== "run" || s.settled) return
    const nextLevel: 1 | 2 = s.hintLevel >= 1 ? 2 : 1
    if (nextLevel === 2) {
      onReveal(s.queue[s.index])
    }
    apply({ ...s, hintLevel: nextLevel })
  }, [apply, onReveal])

  const giveUp = useCallback(() => {
    const s = stateRef.current
    if (s.phase !== "run" || s.settled) return
    const target = partsById.get(s.queue[s.index])
    settle(false, {
      tone: "help",
      text: `Era aquí (etiqueta en el modelo). ${target?.summary ?? ""}`,
    })
  }, [partsById, settle])

  const next = useCallback(() => {
    const s = stateRef.current
    if (s.phase !== "run" || !s.settled) return
    onReveal(null)
    if (s.index + 1 >= s.queue.length) {
      apply({ ...s, phase: "done", settled: false, feedback: null })
      return
    }
    apply({
      ...s,
      index: s.index + 1,
      misses: 0,
      hintLevel: 0,
      feedback: null,
      settled: false,
    })
  }, [apply, onReveal])

  const retryFailed = useCallback(() => {
    const failed = stateRef.current.results
      .filter((result) => !result.solved)
      .map((result) => result.partId)
    startWith(failed)
  }, [startWith])

  const targetId = state.phase === "run" ? state.queue[state.index] : null

  return {
    state,
    active: state.phase !== "idle",
    statsReady: stats !== undefined,
    hasHistory: (stats ?? []).some((row) => row.total > 0),
    targetPart: targetId ? (partsById.get(targetId) ?? null) : null,
    open,
    stop,
    start,
    pick,
    requestHint,
    giveUp,
    next,
    retryFailed,
  }
}

export type PracticeController = ReturnType<typeof usePractice>

export function PracticePanel({
  practice,
  parts,
}: {
  practice: PracticeController
  parts: PartCatalogEntry[]
}) {
  const { state, targetPart } = practice
  const partsById = useMemo(
    () => new Map(parts.map((part) => [part.id, part])),
    [parts]
  )

  if (state.phase === "intro") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 text-sm">
        <p className="font-medium">Práctica de identificación</p>
        <p className="text-muted-foreground">
          Te pido una pieza y la buscas haciendo clic en el modelo. Sin
          etiquetas a la vista: si fallas, te doy pistas; cada intento cuenta
          para tu historial.
        </p>
        {practice.hasHistory ? (
          <p className="text-xs text-muted-foreground">
            Empezamos por las piezas que te costaron en rondas anteriores.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={!practice.statsReady}
            onClick={practice.start}
          >
            {practice.statsReady ? (
              `Empezar (${parts.length} piezas)`
            ) : (
              <Spinner className="size-4" />
            )}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={practice.stop}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  if (state.phase === "run" && targetPart) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 text-sm">
        <p className="text-xs text-muted-foreground">
          Pieza {state.index + 1} de {state.queue.length}
        </p>
        <div className="rounded-lg bg-muted/60 px-3 py-2">
          <p className="text-xs text-muted-foreground">Localiza en el modelo</p>
          <p className="text-base font-semibold">{targetPart.label}</p>
        </div>

        {state.hintLevel >= 1 && !state.settled ? (
          <div className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Pista</p>
            <p>{targetPart.summary}</p>
            {state.hintLevel >= 2 ? (
              <p className="mt-1 font-medium text-foreground">
                Su etiqueta está visible en el modelo.
              </p>
            ) : null}
          </div>
        ) : null}

        {state.feedback ? (
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              state.feedback.tone === "ok"
                ? "bg-primary/15 text-foreground"
                : state.feedback.tone === "help"
                  ? "bg-amber-500/15 text-foreground"
                  : "bg-destructive/10 text-foreground"
            )}
          >
            {state.feedback.text}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Gira el modelo y haz clic donde creas que está.
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          {state.settled ? (
            <Button type="button" size="sm" onClick={practice.next}>
              {state.index + 1 >= state.queue.length
                ? "Ver resumen"
                : "Siguiente"}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={state.hintLevel >= 2}
                onClick={practice.requestHint}
              >
                Pista
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={practice.giveUp}
              >
                No la encuentro
              </Button>
            </>
          )}
          <Button type="button" size="sm" variant="ghost" onClick={practice.stop}>
            Salir
          </Button>
        </div>
      </div>
    )
  }

  if (state.phase === "done") {
    const solved = state.results.filter((result) => result.solved).length
    const failed = state.results.filter((result) => !result.solved)
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 text-sm">
        <p className="font-medium">
          Resultado: {solved} de {state.results.length}
        </p>
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto text-xs">
          {state.results.map((result) => {
            const part = partsById.get(result.partId)
            return (
              <li
                key={result.partId}
                className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5"
              >
                <span>{part?.label ?? result.partId}</span>
                <span
                  className={
                    result.solved ? "text-primary" : "text-muted-foreground"
                  }
                >
                  {result.solved
                    ? result.clicks === 1 && result.hintsUsed === 0
                      ? "a la primera"
                      : `${result.clicks} intentos`
                    : "con ayuda"}
                </span>
              </li>
            )
          })}
        </ul>
        <div className="flex flex-wrap gap-2">
          {failed.length > 0 ? (
            <Button type="button" size="sm" onClick={practice.retryFailed}>
              Repetir falladas ({failed.length})
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant={failed.length > 0 ? "outline" : "default"}
            onClick={practice.start}
          >
            Otra ronda
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={practice.stop}>
            Salir
          </Button>
        </div>
      </div>
    )
  }

  return null
}
