"use client"

import { Accessibility, LocateFixed } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { pillClass } from "@/components/listing/filter-menu"
import { RouteBullets } from "@/components/place/subway-list"
import { useGeolocation } from "@/hooks/use-geolocation"
import { walkMinutes } from "@/lib/planner/estimates"
import type { Station } from "@/lib/subway"

const MAX_WALK = 20
const SHOW = 3

/**
 * "Lines near me": the closest stations and the trains that stop there, each
 * linking to its Ride the line page. Stations load only when asked, and the
 * position never leaves the device.
 */
export function LinesNearMe() {
  const t = useTranslations("ride")
  const tFilters = useTranslations("filters")
  const geo = useGeolocation()
  const origin = geo.state.status === "ready" ? geo.state.position : null
  const [stations, setStations] = useState<Station[] | null>(null)

  useEffect(() => {
    if (!origin || stations) return
    fetch("/api/stations")
      .then((r) => (r.ok ? (r.json() as Promise<Station[]>) : []))
      .then(setStations)
      .catch(() => setStations([]))
  }, [origin, stations])

  const near =
    origin && stations
      ? stations
          .map((station) => ({ station, walk: walkMinutes(origin, station) }))
          .filter((s) => s.walk <= MAX_WALK)
          .sort((a, b) => a.walk - b.walk)
          .slice(0, SHOW)
      : null

  return (
    <section aria-labelledby="near-me" className="space-y-3">
      <button
        type="button"
        onClick={origin ? geo.reset : geo.locate}
        aria-pressed={Boolean(origin)}
        disabled={geo.state.status === "locating"}
        className={pillClass(Boolean(origin))}
      >
        <LocateFixed aria-hidden className="size-4" />
        <span id="near-me">
          {geo.state.status === "locating" ? tFilters("locating") : t("nearMe")}
        </span>
      </button>
      <div aria-live="polite">
        {geo.state.status === "denied" ? (
          <p className="text-sm text-muted-foreground">{tFilters("locationDenied")}</p>
        ) : near === null ? null : near.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noneNear", { minutes: MAX_WALK })}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-3">
            {near.map(({ station, walk }) => (
              <li
                key={`${station.name}-${station.lat}`}
                className="space-y-2 rounded-2xl border bg-card p-4"
              >
                <p className="font-semibold">
                  {station.name}
                  {station.ada ? (
                    <Accessibility
                      role="img"
                      aria-label={t("accessibleStation")}
                      className="ml-1.5 inline size-4 align-[-0.15em] text-line-blue dark:text-sky-300"
                    />
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">{t("walk", { minutes: walk })}</p>
                <RouteBullets routes={station.routes} size="md" linked />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
