"use client"

import { Accessibility, Clock, ExternalLink, MapPin, Navigation, Ruler } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { RouteBullets } from "@/components/place/subway-list"
import { Link } from "@/i18n/navigation"
import { LINES } from "@/lib/lines"
import { cn } from "@/lib/utils"
import { kmFromMiles, type Walk } from "@/lib/walks"
import { BOROUGHS } from "@/types/enums"
import type { Borough } from "@/types/place"

export type WalkCard = Walk & {
  placeSlug?: string
  minutes: number | null
  station: { name: string; routes: string[]; walkMinutes: number } | null
}

type Kind = "all" | "walk" | "hike"
type Level = "all" | "easy" | "moderate"

/** Trail-blaze colors for how hard a walk is. */
const BLAZE = {
  easy: "bg-[#00692c] text-white",
  moderate: "bg-line-orange text-[#1d1f21]",
  mixed: "bg-line-gray text-[#1d1f21]",
} as const

function transitUrl(to: { lat: number; lng: number }) {
  const url = new URL("https://www.google.com/maps/dir/")
  url.searchParams.set("api", "1")
  url.searchParams.set("destination", `${to.lat},${to.lng}`)
  url.searchParams.set("travelmode", "transit")
  return url.toString()
}

export function WalksView({ walks }: { walks: WalkCard[] }) {
  const t = useTranslations("walks")
  const tBorough = useTranslations("borough")
  const [kind, setKind] = useState<Kind>("all")
  const [level, setLevel] = useState<Level>("all")
  const [borough, setBorough] = useState<Borough | "all">("all")

  const shown = walks.filter(
    (w) =>
      (kind === "all" || w.kind === kind) &&
      (level === "all" || w.difficulty === level) &&
      (borough === "all" || w.borough === borough),
  )
  const chip = (active: boolean) =>
    cn(
      "h-9 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
      active
        ? "border-foreground bg-foreground text-background"
        : "border-foreground/15 bg-card hover:border-foreground",
    )

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-8 lg:py-12">
      <div role="group" aria-label={t("filterLabel")} className="flex flex-wrap items-center gap-2">
        {(["all", "walk", "hike"] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={chip(kind === k)}
          >
            {t(`filters.${k}`)}
          </button>
        ))}
        <span aria-hidden className="mx-1 h-6 w-px bg-border" />
        {(["easy", "moderate"] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={level === l}
            onClick={() => setLevel(level === l ? "all" : l)}
            className={chip(level === l)}
          >
            {t(`filters.${l}`)}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm font-semibold">
          <span className="sr-only">{t("boroughLabel")}</span>
          <select
            value={borough}
            onChange={(e) => setBorough(e.target.value as Borough | "all")}
            className="h-9 rounded-full border-2 border-foreground/15 bg-card px-3 font-semibold"
          >
            <option value="all">{t("allBoroughs")}</option>
            {BOROUGHS.map((b) => (
              <option key={b} value={b}>
                {tBorough(b)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p aria-live="polite" className="text-sm font-semibold text-muted-foreground">
        {t("count", { count: shown.length })}
      </p>

      {shown.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed p-8 text-center text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((w) => (
            <li key={w.key}>
              <WalkCardView walk={w} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function WalkCardView({ walk }: { walk: WalkCard }) {
  const t = useTranslations("walks")
  const tBorough = useTranslations("borough")
  const line = LINES[walk.line]
  const level = walk.difficulty ?? "mixed"
  const highlights = t.raw(`items.${walk.key}.highlights`) as string[]
  const title = t(`items.${walk.key}.title`)

  return (
    <article
      aria-labelledby={`walk-${walk.key}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-card"
    >
      <div className={cn("relative aspect-[16/10] overflow-hidden", !walk.photo && line.bg)}>
        {walk.photo ? (
          <Image
            src={walk.photo.url}
            alt={walk.photo.alt}
            fill
            sizes="(min-width: 1280px) 26rem, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 ease-(--ease-out-quint) group-hover:scale-[1.04]"
          />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center text-7xl">
            <span className="absolute inset-0 tile-pattern opacity-60" />
            <span className="relative">{walk.emoji}</span>
          </span>
        )}
        <span
          className={cn(
            "absolute top-3 left-3 rounded-md px-2.5 py-1 text-xs font-bold shadow-sm",
            BLAZE[level],
          )}
        >
          {t(`difficulty.${level}`)}
        </span>
        {walk.photo?.attribution ? (
          <span className="absolute right-2 bottom-2 max-w-[70%] truncate rounded bg-black/55 px-1.5 py-0.5 text-[0.65rem] text-white">
            {walk.photo.attribution.url ? (
              <a
                href={walk.photo.attribution.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {walk.photo.attribution.text}
              </a>
            ) : (
              walk.photo.attribution.text
            )}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1">
          <h2 id={`walk-${walk.key}`} className="font-display text-2xl leading-tight">
            <span aria-hidden className="mr-2">
              {walk.emoji}
            </span>
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {walk.park !== title ? `${walk.park}, ` : ""}
            {tBorough(walk.borough)}
          </p>
        </div>

        <ul className="flex flex-wrap gap-2 text-sm font-semibold">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
            <Ruler aria-hidden className="size-4" />
            {walk.miles !== null
              ? t("length", { miles: walk.miles, km: kmFromMiles(walk.miles) })
              : t("severalTrails")}
          </li>
          {walk.minutes !== null ? (
            <li className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
              <Clock aria-hidden className="size-4" />
              {t("time", { minutes: walk.minutes })}
            </li>
          ) : null}
          {walk.accessible ? (
            <li className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
              <Accessibility aria-hidden className="size-4" />
              {t("accessible")}
            </li>
          ) : null}
        </ul>

        <p className="leading-relaxed">{t(`items.${walk.key}.body`)}</p>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-muted-foreground">{t("along")}</h3>
          <ol className="relative space-y-2.5 pl-6">
            <span
              aria-hidden
              className={cn(
                "draw-on-view-y absolute top-1.5 bottom-1.5 left-[0.4375rem] w-1 rounded-full",
                line.bg,
              )}
            />
            {highlights.map((h, i) => (
              <li key={h} className="relative text-sm">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1 -left-6 size-3.5 rounded-full border-[3px] bg-card",
                    i === 0 ? "border-foreground" : line.border,
                  )}
                />
                {h}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-auto space-y-3 border-t pt-4">
          {walk.station ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{t("nearestSubway")}:</span>
              <span>{walk.station.name}</span>
              <RouteBullets routes={walk.station.routes} size="xs" />
              <span className="text-muted-foreground">
                {t("fromStation", { minutes: walk.station.walkMinutes })}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noSubway")}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <a
              href={transitUrl(walk.start)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-bold text-background"
            >
              <Navigation aria-hidden className="size-4" />
              {t("directions")}
            </a>
            {walk.placeSlug ? (
              <Link
                href={`/place/${walk.placeSlug}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-foreground px-4 text-sm font-bold"
              >
                <MapPin aria-hidden className="size-4" />
                {t("parkPage")}
              </Link>
            ) : null}
            <a
              href={walk.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
            >
              <ExternalLink aria-hidden className="size-3.5" />
              {t("details", { name: walk.source.name })}
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
