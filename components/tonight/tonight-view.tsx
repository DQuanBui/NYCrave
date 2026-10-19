"use client"

import { Moon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { LineBullet } from "@/components/brand/line-bullet"
import { PlacePhoto } from "@/components/place/place-photo"
import { useNow } from "@/hooks/use-now"
import { Link } from "@/i18n/navigation"
import type { CardPlace } from "@/lib/card-place"
import { formatClockTime, isOpen, nycClock } from "@/lib/hours"
import { CATEGORY_META } from "@/lib/taxonomy"
import { eveningWeekday, LATE_CATEGORIES, LATE_SLOTS, statusAt } from "@/lib/tonight"
import { cn } from "@/lib/utils"

/** Pick an hour tonight and see what is still open then. */
export function TonightView({ places }: { places: CardPlace[] }) {
  const t = useTranslations("tonight")
  const tc = useTranslations("categories")
  const locale = useLocale()
  const now = useNow()
  const [chosen, setChosen] = useState<number | null>(null)

  if (!now) {
    return <div aria-busy className="h-64 animate-pulse rounded-3xl bg-muted" />
  }

  const clock = nycClock(now)
  const evening = eveningWeekday(clock)
  // Where "now" falls on tonight's timeline, so hours already past can be skipped
  const nowSlot = clock.minutes + (clock.weekday === evening ? 0 : 1440)
  const upcoming = LATE_SLOTS.filter((s) => s >= nowSlot - 30)
  const slot = chosen ?? upcoming[0] ?? LATE_SLOTS.at(-1)!

  const open = places.flatMap((place) => {
    const status = statusAt(place.hours, evening, slot)
    return isOpen(status) ? [{ place, status }] : []
  })
  const groups = LATE_CATEGORIES.map((c) => ({
    category: c,
    items: open.filter((o) => o.place.category === c),
  })).filter((g) => g.items.length)

  return (
    <div className="space-y-8">
      <div
        role="radiogroup"
        aria-label={t("pick")}
        className="flex flex-wrap items-center gap-2 rounded-3xl bg-[#0d1b3d] p-3 text-white sm:p-4"
      >
        <Moon aria-hidden className="mx-2 size-5 text-[#f7b538]" />
        {LATE_SLOTS.map((s) => {
          const past = !upcoming.includes(s)
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={s === slot}
              disabled={past}
              onClick={() => setChosen(s)}
              className={cn(
                "h-11 rounded-full px-5 font-bold tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                s === slot ? "bg-[#f7b538] text-black" : "bg-white/10 hover:bg-white/20",
              )}
            >
              {formatClockTime(s, locale)}
            </button>
          )
        })}
      </div>

      <p aria-live="polite" className="font-semibold">
        {t("count", { count: open.length, time: formatClockTime(slot, locale) })}
      </p>

      {groups.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-foreground/30 px-5 py-6 text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        groups.map(({ category, items }) => (
          <section key={category} aria-labelledby={`late-${category}`} className="space-y-3">
            <h2 id={`late-${category}`} className="flex items-center gap-2 font-display text-2xl">
              <LineBullet line={CATEGORY_META[category].line} size="sm">
                {CATEGORY_META[category].bullet}
              </LineBullet>
              {tc(`${category}.title`)}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(({ place, status }) => (
                <li key={place.slug}>
                  <Link
                    href={`/place/${place.slug}`}
                    className="flex h-full items-center gap-3 rounded-2xl border bg-card p-2 pr-3 transition-colors hover:border-foreground"
                  >
                    <PlacePhoto
                      place={place}
                      sizes="64px"
                      showChip={false}
                      className="size-16 shrink-0 rounded-xl"
                    />
                    <span className="min-w-0">
                      <span className="line-clamp-1 font-semibold">{place.name}</span>
                      <span className="block text-sm text-muted-foreground">
                        {place.neighborhood}
                      </span>
                      <span className="text-sm font-semibold text-[#00692c] dark:text-green-400">
                        {status.state === "open_24h"
                          ? t("allNight")
                          : status.state === "open" || status.state === "closing_soon"
                            ? t("until", { time: formatClockTime(status.closesAt.minutes, locale) })
                            : null}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
