"use client"

import { Share2, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { EmptyState } from "@/components/brand/empty-state"
import { LineBullet } from "@/components/brand/line-bullet"
import { SignBand } from "@/components/brand/sign-band"
import { useHydrated } from "@/hooks/use-now"
import { usePassport } from "@/hooks/use-passport"
import { Link } from "@/i18n/navigation"
import { LINES } from "@/lib/lines"
import { badgeProgress, BADGES } from "@/lib/passport"
import { BOROUGH_META, CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { BOROUGHS } from "@/types/enums"
import type { Borough, Category } from "@/types/place"

export type PassportPlace = {
  slug: string
  name: string
  neighborhood: string
  category: Category
  borough: Borough
}

/** Each badge stamp sits at its own slight angle, like real ink stamps. */
const TILT = [-8, 5, -3, 9, -6, 2, 7, -9, 4, -4, 8, -2]
const BADGE_LINE = ["red", "orange", "yellow", "green", "blue", "purple", "lime", "brown"] as const

export function PassportView({ places }: { places: PassportPlace[] }) {
  const t = useTranslations("passport")
  const tBorough = useTranslations("borough")
  const locale = useLocale()
  const hydrated = useHydrated()
  const { stamps: stored, remove } = usePassport()
  const stamps = hydrated ? stored : {}
  const [shared, setShared] = useState<"copied" | null>(null)

  const byslug = new Map(places.map((p) => [p.slug, p]))
  const visited = Object.entries(stamps).sort(([, a], [, b]) => b.at - a.at)
  const progress = badgeProgress(stamps)
  const earned = progress.filter((p) => p.earned).length
  const boroughs = new Set(Object.values(stamps).map((s) => s.borough))
  const date = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" })

  async function share() {
    const text = t("shareText", { count: visited.length })
    const url = window.location.origin
    try {
      if (navigator.share) {
        await navigator.share({ title: t("title"), text, url })
        return
      }
      await navigator.clipboard.writeText(`${text} ${url}`)
      setShared("copied")
    } catch {
      // The visitor closed the share sheet
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 lg:px-8 lg:py-12">
      <div className="grid overflow-hidden rounded-3xl shadow-[0_24px_60px_-24px_rgba(29,31,33,0.5)] lg:grid-cols-[0.85fr_1.15fr]">
        {/* Cover page */}
        <section
          aria-labelledby="passport-title"
          className="relative flex flex-col gap-6 bg-sign p-6 text-sign-foreground sm:p-8 lg:p-10"
        >
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="grid size-16 shrink-0 place-items-center rounded-full border-2 border-taxi text-3xl ring-4 ring-taxi/25 ring-offset-4 ring-offset-sign"
            >
              🗽
            </span>
            <div>
              <h1 id="passport-title" className="font-display text-display-md">
                {t("title")}
              </h1>
              <p className="text-sm text-sign-foreground/70">{t("tagline")}</p>
            </div>
          </div>

          <p className="font-display text-7xl leading-none text-taxi tabular-nums sm:text-8xl">
            {visited.length}
            <span className="ml-3 align-middle font-sans text-lg font-bold text-sign-foreground/80">
              {t("stamps", { count: visited.length })}
            </span>
          </p>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-sign-foreground/70">
              {t("boroughs", { count: boroughs.size })}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {BOROUGHS.map((b) => {
                const on = boroughs.has(b)
                return (
                  <li key={b} className="flex items-center gap-2">
                    <LineBullet
                      line={BOROUGH_META[b].line}
                      size="sm"
                      className={cn("transition-opacity", !on && "opacity-25 grayscale")}
                    >
                      {BOROUGH_META[b].bullet}
                    </LineBullet>
                    <span
                      className={cn("text-sm", on ? "font-semibold" : "text-sign-foreground/50")}
                    >
                      {tBorough(b)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={share}
              disabled={visited.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-taxi px-4 text-sm font-bold text-taxi-foreground disabled:opacity-50"
            >
              <Share2 aria-hidden className="size-4" />
              {t("share")}
            </button>
            {shared ? (
              <span role="status" className="text-sm text-sign-foreground/80">
                {t("copied")}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-sign-foreground/60">{t("privacy")}</p>
        </section>

        {/* Stamp page */}
        <section aria-labelledby="badges" className="space-y-6 passport-paper p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="badges" className="font-display text-display-md">
              {t("badgesTitle")}
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              {t("earned", { count: earned, total: BADGES.length })}
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4">
            {progress.map(({ badge, count, earned: on }, i) => {
              const line = LINES[BADGE_LINE[i % BADGE_LINE.length]]
              return (
                <li key={badge.key} className="flex flex-col items-center gap-2 text-center">
                  <span
                    aria-hidden
                    style={{ rotate: `${TILT[i % TILT.length]}deg` }}
                    className={cn(
                      "relative grid size-20 place-items-center rounded-full border-4 text-3xl sm:size-24 sm:text-4xl",
                      on
                        ? cn(line.border, "bg-background/60 shadow-sm")
                        : "border-dashed border-foreground/20 grayscale",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute inset-1.5 rounded-full border-2 border-dashed",
                        on ? line.border : "border-transparent",
                      )}
                    />
                    <span className={cn(!on && "opacity-35")}>{badge.emoji}</span>
                  </span>
                  <span className="text-sm leading-tight font-bold">
                    {t(`badges.${badge.key}.name`)}
                  </span>
                  <span className="text-xs leading-snug text-muted-foreground">
                    {on
                      ? t(`badges.${badge.key}.body`)
                      : t("progress", { count, goal: badge.goal })}
                  </span>
                  <span className="sr-only">{on ? t("badgeEarned") : t("badgeLocked")}</span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <section aria-labelledby="visited" className="space-y-5">
        <SignBand id="visited" title={t("visited")} />
        {visited.length === 0 ? (
          <EmptyState
            line="yellow"
            bullet="!"
            title={t("empty.title")}
            body={t("empty.body")}
            action={
              <Link
                href="/search"
                className="inline-flex h-11 items-center rounded-full bg-taxi px-6 font-bold text-taxi-foreground"
              >
                {t("empty.cta")}
              </Link>
            }
          />
        ) : (
          <ul className="divide-y rounded-2xl border bg-card">
            {visited.map(([slug, s]) => {
              const place = byslug.get(slug)
              const meta = CATEGORY_META[s.category]
              return (
                <li key={slug} className="flex items-center gap-3 px-4 py-3">
                  <LineBullet line={meta.line} size="sm">
                    {meta.bullet}
                  </LineBullet>
                  <div className="min-w-0 flex-1">
                    {place ? (
                      <Link
                        href={`/place/${slug}`}
                        className="font-semibold underline-offset-4 hover:underline"
                      >
                        {place.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{slug}</span>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {place ? `${place.neighborhood}, ${tBorough(s.borough)}. ` : null}
                      {t("stampedOn", { date: date.format(s.at) })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(slug)}
                    aria-label={t("remove", { name: place?.name ?? slug })}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
