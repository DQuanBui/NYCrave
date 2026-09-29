"use client"

import { CloudRain, Pause, Play, Sun } from "lucide-react"
import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { HolidayNote } from "@/components/brand/holiday-note"
import { LineBullet } from "@/components/brand/line-bullet"
import { RouteArt } from "@/components/brand/route-art"
import { MoodChips } from "@/components/home/mood-chips"
import { SmartSearch, type SearchHint } from "@/components/home/smart-search"
import { SubwayTrack } from "@/components/home/subway-track"
import { Link } from "@/i18n/navigation"
import type { Holiday } from "@/lib/holidays"
import { HERO_SCENES, type HeroScene } from "@/lib/home"
import { LINES } from "@/lib/lines"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"

const ROTATE_MS = 4200
const EASE = [0.22, 1, 0.36, 1] as const

/**
 * "The next stop is …" — destinations rotate like a platform announcement.
 * Autoplay stops for reduced motion, on hover/focus, when paused, or in a background tab.
 */
type HeroProps = {
  hints?: SearchHint[]
  /** Today's New York forecast, when available. */
  forecast?: {
    tempMaxF: number
    chance: number
    rainLikely: boolean
    extreme: "hot" | "cold" | null
  } | null
  /** Today's holiday in New York, when hours may differ. */
  holiday?: Holiday
}

export function Hero({ hints, forecast, holiday }: HeroProps) {
  const t = useTranslations("hero")
  const reduceMotion = useReducedMotion()
  // prev stays painted underneath while the next scene wipes in over it
  const [{ index, prev }, setScenes] = useState({ index: 0, prev: 0 })
  const go = (next: number) =>
    setScenes((s) => (s.index === next ? s : { index: next, prev: s.index }))
  const [paused, setPaused] = useState(false)
  const [holding, setHolding] = useState(false)
  // Rotation starts once the visitor interacts, so the first scene stays put while
  // the page loads (and stays the largest contentful paint).
  const [engaged, setEngaged] = useState(false)
  const autoplay = engaged && !reduceMotion && !paused && !holding

  useEffect(() => {
    if (engaged) return
    const events = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart"] as const
    const engage = () => setEngaged(true)
    for (const e of events) window.addEventListener(e, engage, { once: true, passive: true })
    return () => {
      for (const e of events) window.removeEventListener(e, engage)
    }
  }, [engaged])

  useEffect(() => {
    if (!autoplay) return
    const id = setInterval(() => {
      if (!document.hidden) {
        setScenes((s) => ({ index: (s.index + 1) % HERO_SCENES.length, prev: s.index }))
      }
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [autoplay])

  const scene = HERO_SCENES[index]
  const meta = CATEGORY_META[scene.category]
  const sceneLabel = t(`scenes.${scene.key}`)

  return (
    <section className="mx-auto grid max-w-7xl gap-10 overflow-x-clip px-4 pt-6 pb-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16 lg:px-8 lg:pt-16 lg:pb-24">
      <div className="flex min-w-0 flex-col gap-6">
        <h1>
          <span className="block text-lg font-semibold text-muted-foreground sm:text-xl">
            {t("welcome.lead")}
          </span>
          <span
            aria-hidden
            className="mt-1 -mb-[0.12em] block overflow-hidden pt-[0.06em] pb-[0.12em] font-display text-[clamp(4.25rem,13vw,8.75rem)] leading-[0.92]"
          >
            <PopLetters text={t("welcome.city")} />
          </span>
          <span className="sr-only">
            {t("welcome.lead")} {t("welcome.city")}
          </span>
        </h1>

        <SubwayTrack
          trainKey={scene.key}
          line={meta.line}
          bullet={meta.bullet}
          className="-mt-2 max-w-2xl"
        />

        <div>
          <p className="flex items-center gap-2.5 text-base font-semibold text-muted-foreground sm:text-lg">
            <LineBullet line={meta.line} size="sm" className="transition-colors duration-500">
              {meta.bullet}
            </LineBullet>
            {t("announcement")}
            <span className="sr-only">{t("srAlt")}</span>
          </p>
          <span
            aria-hidden
            className="relative mt-1 grid overflow-hidden font-display text-[clamp(2rem,5.5vw,3.4rem)] leading-(--hero-leading)"
          >
            {/* Invisible copies size the box to the longest destination, so nothing jumps */}
            {HERO_SCENES.map((s) => (
              <span
                key={s.key}
                className="invisible col-start-1 row-start-1 py-[0.08em] text-balance"
              >
                {t(`scenes.${s.key}`)}
              </span>
            ))}
            <AnimatePresence initial={false}>
              <m.span
                key={scene.key}
                className="absolute inset-x-0 top-[0.08em] text-balance"
                initial={{ y: "70%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-70%", opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                {sceneLabel}
              </m.span>
            </AnimatePresence>
          </span>
        </div>
        <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
          {t("intro")}
        </p>

        <SmartSearch className="max-w-2xl" hints={hints} />
        {forecast ? (
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            {forecast.rainLikely ? (
              <CloudRain aria-hidden className="mt-0.5 size-4 shrink-0 text-line-blue" />
            ) : (
              <Sun aria-hidden className="mt-0.5 size-4 shrink-0 text-line-orange" />
            )}
            <span>
              {t("weather", { temp: forecast.tempMaxF, chance: forecast.chance })}{" "}
              {forecast.rainLikely || forecast.extreme ? (
                <Link
                  href={{ pathname: "/search", query: { q: "rainy day" } }}
                  className="font-semibold text-foreground underline underline-offset-4"
                >
                  {t(
                    forecast.rainLikely
                      ? "rainyIdeas"
                      : forecast.extreme === "hot"
                        ? "hotIdeas"
                        : "coldIdeas",
                  )}
                </Link>
              ) : null}
            </span>
          </p>
        ) : null}
        {holiday ? <HolidayNote holiday={holiday} className="max-w-2xl" /> : null}
        <MoodChips className="max-w-2xl" />
      </div>

      <div
        className="relative isolate mx-4 my-6 sm:mx-10 lg:mx-0 lg:rotate-[1.5deg]"
        onMouseEnter={() => setHolding(true)}
        onMouseLeave={() => setHolding(false)}
        onFocus={() => setHolding(true)}
        onBlur={() => setHolding(false)}
      >
        <div className="absolute -inset-x-10 -inset-y-8 -z-10 sm:-inset-x-16 lg:-inset-x-32 lg:-inset-y-16">
          <RouteArt className="size-full" />
        </div>
        <div className="rounded-2xl bg-sign p-2.5 shadow-[0_24px_60px_-20px_rgba(29,31,33,0.55)]">
          <Link
            href={{ pathname: "/search", query: { q: scene.query } }}
            aria-label={t("searchScene", { scene: sceneLabel })}
            className="relative block aspect-[16/10] overflow-hidden rounded-lg sm:aspect-[16/9] lg:aspect-[4/5]"
          >
            {prev !== index ? (
              <SceneArt scene={HERO_SCENES[prev]} className="absolute inset-0" />
            ) : null}
            <m.div
              key={scene.key}
              className="absolute inset-0"
              initial={prev === index ? false : { clipPath: "inset(0 0 0 100%)" }}
              animate={{ clipPath: "inset(0 0 0 0%)" }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <SceneArt scene={scene} className="absolute inset-0" priority />
            </m.div>
          </Link>

          <div className="mt-2.5 flex items-center gap-3 rounded-md sign-band px-3 pt-4 pb-2.5">
            <ol className="flex flex-1 items-center" aria-label={t("announcement")}>
              {HERO_SCENES.map((s, i) => {
                const active = i === index
                return (
                  <li key={s.key} className="flex flex-1 items-center last:flex-none">
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={active ? "step" : undefined}
                      aria-label={t(`scenes.${s.key}`)}
                      className="grid size-6 place-items-center rounded-full"
                    >
                      <span
                        className={cn(
                          "rounded-full transition-all duration-300",
                          LINES[CATEGORY_META[s.category].line].bg,
                          active ? "size-4 ring-2 ring-white" : "size-2.5 opacity-70",
                        )}
                      />
                    </button>
                    {i < HERO_SCENES.length - 1 ? (
                      <span aria-hidden className="h-0.5 flex-1 bg-sign-foreground/30" />
                    ) : null}
                  </li>
                )
              })}
            </ol>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? t("play") : t("pause")}
              aria-pressed={paused}
              className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/10"
            >
              {paused ? (
                <Play aria-hidden className="size-4" />
              ) : (
                <Pause aria-hidden className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * The city's name, each letter rising out of its slot like a sign flipping on. Letters move
 * but never fade, so the headline paints immediately.
 */
function PopLetters({ text }: { text: string }) {
  let i = 0
  return text.split(" ").map((word, w, words) => (
    <span key={w} className="inline-block whitespace-nowrap">
      {Array.from(word).map((ch) => (
        <span
          key={i}
          style={{ "--i": i++ } as React.CSSProperties}
          className="inline-block origin-bottom animate-[letter-pop_0.7s_cubic-bezier(0.2,0.8,0.3,1)_both] [animation-delay:calc(var(--i)*60ms+120ms)]"
        >
          {ch}
        </span>
      ))}
      {w < words.length - 1 ? "\u00a0" : null}
    </span>
  ))
}

function SceneArt({
  scene,
  className,
  priority,
}: {
  scene: HeroScene
  className?: string
  priority?: boolean
}) {
  const line = LINES[CATEGORY_META[scene.category].line]
  if (scene.image) {
    return (
      <div className={className}>
        <Image
          src={scene.image.src}
          alt={scene.image.alt}
          fill
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          sizes="(min-width: 1024px) 40vw, calc(100vw - 80px)"
          className="object-cover"
        />
      </div>
    )
  }
  return (
    <div aria-hidden className={cn(line.bg, line.fg, className)}>
      <div className="absolute inset-0 tile-pattern" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/15" />
      <span className="absolute inset-0 grid place-items-center text-[7rem] drop-shadow-[0_12px_18px_rgba(0,0,0,0.3)] sm:text-[9rem]">
        {scene.emoji}
      </span>
    </div>
  )
}
