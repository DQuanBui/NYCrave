"use client"

import { useLocale, useTranslations } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"
import { NextLanes } from "@/components/next/next-lanes"
import { useNow } from "@/hooks/use-now"
import { Link } from "@/i18n/navigation"
import { formatClockTime, nycClock } from "@/lib/hours"
import { cn } from "@/lib/utils"
import { afterFor, whatsNext, type NextPlace } from "@/lib/whats-next"
import type { Place } from "@/types/place"

type Here = Pick<
  Place,
  "slug" | "name" | "lat" | "lng" | "category" | "drinkTypes" | "timeNeededMinutes"
> & { neighborhoodSlug?: string }

/** Shared by every place page: the card list is fetched once per visit. */
let cache: Promise<NextPlace[]> | null = null
const loadPlaces = () =>
  (cache ??= fetch("/api/places/cards")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .catch((e) => {
      cache = null
      throw e
    }))

/** "What's next after this place": walkable picks open when you would leave. */
export function NextNearby({ here }: { here: Here }) {
  const t = useTranslations("next")
  const locale = useLocale()
  const now = useNow()
  const box = useRef<HTMLElement>(null)
  const [places, setPlaces] = useState<NextPlace[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [leavingNow, setLeavingNow] = useState(false)

  // Load the list only when the section comes near the screen
  useEffect(() => {
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        loadPlaces().then(setPlaces, () => setFailed(true))
      },
      { rootMargin: "400px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const stay = here.timeNeededMinutes ?? 60
  // Whole minutes, so the suggestions refresh once a minute at most
  const leaveMinute = now ? Math.floor(now.getTime() / 60_000) + (leavingNow ? 0 : stay) : null
  const leaveAt = leaveMinute === null ? null : new Date(leaveMinute * 60_000)
  const after = afterFor(here)
  const { lat, lng, slug } = here
  const lanes = useMemo(
    () =>
      places && leaveMinute !== null
        ? whatsNext(places, {
            from: { lat, lng },
            after,
            leaveAt: new Date(leaveMinute * 60_000),
            exclude: [slug],
          })
        : null,
    [places, leaveMinute, after, lat, lng, slug],
  )

  const moreHref = {
    pathname: "/next" as const,
    query: { after, ...(here.neighborhoodSlug ? { from: here.neighborhoodSlug } : {}) },
  }

  return (
    <section ref={box} aria-labelledby="whats-next" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 id="whats-next" className="font-display text-display-md">
            {t("afterPlace", { name: here.name })}
          </h2>
          <p className="text-muted-foreground">
            {leaveAt
              ? t("leaveAround", { time: formatClockTime(nycClock(leaveAt).minutes, locale) })
              : t("intro")}
          </p>
        </div>
        <div
          role="group"
          aria-label={t("whenLabel")}
          className="flex rounded-full border-2 border-foreground p-0.5 text-sm font-bold"
        >
          {([false, true] as const).map((nowMode) => (
            <button
              key={String(nowMode)}
              type="button"
              aria-pressed={leavingNow === nowMode}
              onClick={() => setLeavingNow(nowMode)}
              className={cn(
                "rounded-full px-3.5 py-1.5 transition-colors",
                leavingNow === nowMode ? "bg-foreground text-background" : "hover:bg-accent",
              )}
            >
              {nowMode ? t("leavingNow") : t("whenIFinish")}
            </button>
          ))}
        </div>
      </div>

      {failed ? (
        <p className="text-muted-foreground">{t("loadError")}</p>
      ) : !lanes ? (
        <div aria-hidden className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-30 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : lanes.length ? (
        <NextLanes lanes={lanes} />
      ) : (
        <p className="rounded-2xl border-2 border-dashed p-6 text-center text-muted-foreground">
          {t(leavingNow ? "emptyNear" : "emptyLater")}
        </p>
      )}

      <Link href={moreHref} className="inline-block font-bold underline underline-offset-4">
        {t("more")}
      </Link>
    </section>
  )
}
