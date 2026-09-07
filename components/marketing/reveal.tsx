"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Transition delay, e.g. "120ms". Applied once the element enters view. */
  delay?: string
}

/**
 * Toggles the `.animate` class on `.animate-on-scroll` elements when they
 * enter the viewport (see globals.css). State-based so re-renders with a
 * different className don't wipe the revealed state.
 */
export function Reveal({ children, className, delay }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn("animate-on-scroll", shown && "animate", className)}
      style={delay ? { transitionDelay: delay } : undefined}
    >
      {children}
    </div>
  )
}
