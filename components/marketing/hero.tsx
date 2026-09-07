"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useTranslations } from "next-intl"

import { LandingCta } from "@/components/marketing/landing-cta"

gsap.registerPlugin(useGSAP)

const domainChips = ["computing", "architecture", "mechanics"] as const

const HERO_FIGURE = "/marketing/hero-2_upscaled.jpg"

function HeroAtmosphere() {
  return (
    <div
      aria-hidden
      className="hero-orbit pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="hero-plate absolute inset-[-4%] will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element -- local hero still, faded into the black canvas */}
        <img
          src={HERO_FIGURE}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          className="hero-figure-mask size-full object-cover object-[70%_38%] brightness-[0.88] contrast-110 md:object-[58%_42%]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black via-black/50 to-transparent md:via-black/30" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent" />
      </div>
    </div>
  )
}

export function HeroSection() {
  const t = useTranslations("Marketing")
  const tTopics = useTranslations("Topics")
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const reduceMotion = Boolean(context.conditions?.reduceMotion)
          const isCoarse = window.matchMedia("(pointer: coarse)").matches
          const intro = root.querySelectorAll(".hero-intro")
          const plate = root.querySelector(".hero-plate")
          const scrollLine = root.querySelector(".hero-scroll-line")

          if (reduceMotion) {
            gsap.set(intro, { autoAlpha: 1, y: 0, filter: "none" })
            gsap.set(plate, { autoAlpha: 1, scale: 1, filter: "none" })
            return
          }

          gsap.set(intro, { autoAlpha: 0, y: 28, filter: "blur(8px)" })
          gsap.set(plate, { autoAlpha: 0, scale: 1.22, filter: "blur(18px)" })

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

          tl.to(plate, {
            autoAlpha: 1,
            scale: 1.04,
            filter: "blur(0px)",
            duration: 1.8,
          }).to(
            intro,
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.85,
              stagger: 0.1,
            },
            0.4
          )

          gsap.to(plate, {
            scale: isCoarse ? 1.03 : 1.06,
            duration: 22,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.8,
          })

          if (scrollLine) {
            gsap.to(scrollLine, {
              scaleY: 0.45,
              transformOrigin: "top",
              duration: 1.4,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            })
          }

          if (!plate || isCoarse) return

          const xTo = gsap.quickTo(plate, "x", {
            duration: 0.9,
            ease: "power3",
          })
          const yTo = gsap.quickTo(plate, "y", {
            duration: 0.9,
            ease: "power3",
          })

          const onMove = (event: MouseEvent) => {
            const rect = root.getBoundingClientRect()
            const nx = (event.clientX - rect.left) / rect.width - 0.5
            const ny = (event.clientY - rect.top) / rect.height - 0.5
            xTo(nx * 22)
            yTo(ny * 14)
          }

          root.addEventListener("mousemove", onMove)
          return () => {
            root.removeEventListener("mousemove", onMove)
          }
        },
        root
      )

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-svh flex-col px-6 pt-24 pb-6 md:justify-center md:pt-28 md:pb-24"
    >
      <HeroAtmosphere />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-5 md:flex-none md:gap-10">
        <div className="hero-intro motion-reduce:opacity-100 max-w-3xl opacity-0">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur">
            <span className="rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
              {t("versionBadge")}
            </span>
            <span className="font-mono text-xs tracking-[0.18em] text-neutral-300 uppercase">
              {t("badge")}
            </span>
          </div>
        </div>

        <h1 className="hero-intro motion-reduce:opacity-100 max-w-4xl font-heading text-[2.35rem] leading-[0.95] font-semibold tracking-tight text-balance opacity-0 sm:text-6xl lg:text-8xl">
          <span className="text-glow block uppercase">{t("heroTitleBefore")}</span>
          <span className="mt-2 block text-primary">{t("heroTitleAccent")}</span>
        </h1>

        <p className="hero-intro motion-reduce:opacity-100 max-w-md text-base leading-relaxed text-neutral-400 opacity-0 sm:text-lg">
          {t("heroLead")}
        </p>

        <div className="hero-intro motion-reduce:opacity-100 flex flex-col items-start gap-4 opacity-0 sm:flex-row sm:flex-wrap sm:items-center">
          <LandingCta />
          <ul className="flex flex-wrap gap-2">
            {domainChips.map((key) => (
              <li
                key={key}
                className="rounded-full border border-white/10 bg-neutral-950/50 px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-neutral-400 uppercase"
              >
                {tTopics(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hero-intro motion-reduce:opacity-100 relative z-20 mx-auto mt-8 hidden items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-3 opacity-0 backdrop-blur md:absolute md:bottom-8 md:left-8 md:mt-0 md:flex">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
            {t("heroStatusLabel")}
          </p>
          <p className="font-mono text-xs text-neutral-200">
            {t("heroStatusValue")}
          </p>
        </div>
      </div>

      <div className="hero-intro motion-reduce:opacity-100 relative z-20 mx-auto mt-8 flex flex-col items-center gap-2 opacity-0 md:absolute md:bottom-8 md:left-1/2 md:mt-0 md:-translate-x-1/2 md:gap-3">
        <p className="font-mono text-[10px] tracking-[0.3em] text-neutral-500 uppercase">
          {t("scrollHint")}
        </p>
        <div className="hero-scroll-line h-8 w-px origin-top bg-linear-to-b from-white/70 to-transparent md:h-14" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-5"
      >
        <div className="h-24 bg-linear-to-t from-black to-transparent md:h-40" />
        <div className="hidden h-20 bg-black md:block" />
      </div>
    </section>
  )
}
