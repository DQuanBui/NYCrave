"use client"

import { Sunrise, Sunset } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useNow } from "@/hooks/use-now"
import { formatClockTime, nycClock } from "@/lib/hours"
import type { LightBand, LightPhase } from "@/lib/photo-walks"
import { cn } from "@/lib/utils"

export const PHASE_COLOR: Record<LightPhase, string> = {
  night: "#0d1b3d",
  blue: "#2456b8",
  dawn: "#f27d72",
  golden: "#f7b538",
  day: "#8fd0f5",
  dusk: "#e8607a",
}

const pct = (minute: number) => `${(minute / 1440) * 100}%`

/**
 * Today's sky as a 24-hour ribbon, with a live marker for the current minute in
 * New York and what the light is doing next.
 */
export function SkyRibbon({
  bands,
  sunrise,
  sunset,
}: {
  bands: LightBand[]
  sunrise: number
  sunset: number
}) {
  const t = useTranslations("goldenHour")
  const locale = useLocale()
  const now = useNow()
  const minute = now ? nycClock(now).minutes : null
  const current = minute === null ? null : bands.find((b) => b.start <= minute && minute < b.end)
  const next = current
    ? bands.find((b) => b.start >= current.end && b.phase !== current.phase)
    : null

  // Each band holds its color, blending into the next over a few minutes
  const stops = bands
    .filter((b) => b.end > b.start)
    .flatMap((b) => {
      const blend = Math.min(15, (b.end - b.start) / 4)
      const color = PHASE_COLOR[b.phase]
      return [`${color} ${pct(b.start + blend)}`, `${color} ${pct(b.end - blend)}`]
    })
  const gradient = `linear-gradient(to right, ${stops.join(", ")})`

  return (
    <div className="space-y-4">
      <div className="relative pt-8">
        {[
          {
            at: sunrise,
            icon: Sunrise,
            label: t("sunriseAt", { time: formatClockTime(sunrise, locale) }),
          },
          {
            at: sunset,
            icon: Sunset,
            label: t("sunsetAt", { time: formatClockTime(sunset, locale) }),
          },
        ].map(({ at, icon: Icon, label }) => (
          <span
            key={label}
            className="absolute top-0 flex -translate-x-1/2 items-center gap-1 text-xs font-semibold whitespace-nowrap text-muted-foreground"
            style={{ left: pct(at) }}
          >
            <Icon aria-hidden className="size-3.5 text-line-orange" />
            {label}
          </span>
        ))}
        <div
          aria-hidden
          className="relative h-16 overflow-hidden rounded-2xl shadow-inner ring-1 ring-black/10 sm:h-20"
          style={{ background: gradient }}
        >
          {/* A soft shimmer drifting across the sky */}
          <div className="absolute inset-0 bg-[linear-gradient(100deg,transparent_30%,rgb(255_255_255/0.22)_50%,transparent_70%)] bg-[length:200%_100%] motion-safe:animate-[sky-shimmer_9s_ease-in-out_infinite]" />
          {[6, 12, 18].map((h) => (
            <span
              key={h}
              className="absolute inset-y-0 w-px bg-white/25"
              style={{ left: pct(h * 60) }}
            />
          ))}
        </div>
        {minute !== null ? (
          <div
            aria-hidden
            className="pointer-events-none absolute top-6 bottom-[-0.5rem] flex -translate-x-1/2 flex-col items-center"
            style={{ left: pct(minute) }}
          >
            <span className="relative mt-auto grid size-4 place-items-center">
              <span className="absolute inset-0 rounded-full bg-foreground/40 motion-safe:animate-ping" />
              <span className="relative size-3 rounded-full border-2 border-background bg-foreground" />
            </span>
            <span className="order-first h-full w-0.5 rounded-full bg-foreground" />
          </div>
        ) : null}
        <div
          aria-hidden
          className="mt-3 flex justify-between text-[0.7rem] font-semibold text-muted-foreground tabular-nums"
        >
          {[0, 6, 12, 18, 24].map((h) => (
            <span key={h}>{formatClockTime((h % 24) * 60, locale)}</span>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="flex min-h-7 flex-wrap items-center gap-x-3 gap-y-1">
        {current ? (
          <>
            <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-sm font-bold text-background">
              <span
                aria-hidden
                className="size-2.5 rounded-full ring-1 ring-white/50"
                style={{ background: PHASE_COLOR[current.phase] }}
              />
              {t("now", { phase: t(`phase.${current.phase}`) })}
            </span>
            {next ? (
              <span className="text-sm text-muted-foreground">
                {t("next", {
                  phase: t(`phase.${next.phase}`),
                  time: formatClockTime(next.start, locale),
                })}
              </span>
            ) : null}
          </>
        ) : null}
      </p>

      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label={t("legend")}>
        {(["night", "blue", "dawn", "golden", "day", "dusk"] as const).map((phase) => (
          <li key={phase} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={cn("size-3 rounded-full ring-1 ring-foreground/25")}
              style={{ background: PHASE_COLOR[phase] }}
            />
            {t(`phase.${phase}`)}
          </li>
        ))}
      </ul>
    </div>
  )
}
