"use client"

import { LocateFixed } from "lucide-react"
import { pillClass } from "@/components/listing/filter-menu"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Link } from "@/i18n/navigation"
import { distanceKm } from "@/lib/geo"

type Hood = { slug: string; name: string; lat: number; lng: number; count: string }

/**
 * "Near me" on the neighborhoods page: the three closest neighborhoods with
 * places, nearest first. The position stays on the device. Labels come from
 * the server, since the neighborhoods messages are not sent to the browser.
 */
export function NearbyHoods({
  hoods,
  labels,
}: {
  hoods: Hood[]
  labels: { nearMe: string; locating: string; denied: string; away: string }
}) {
  const geo = useGeolocation()
  const origin = geo.state.status === "ready" ? geo.state.position : null
  const nearest = origin
    ? hoods
        .map((h) => ({ ...h, miles: distanceKm(origin, h) / 1.609 }))
        .sort((a, b) => a.miles - b.miles)
        .slice(0, 3)
    : []

  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-pressed={Boolean(origin)}
        onClick={origin ? geo.reset : geo.locate}
        disabled={geo.state.status === "locating"}
        className={pillClass(Boolean(origin))}
      >
        <LocateFixed aria-hidden className="size-4" />
        {geo.state.status === "locating" ? labels.locating : labels.nearMe}
      </button>
      <div aria-live="polite">
        {geo.state.status === "denied" ? (
          <p className="text-sm text-muted-foreground">{labels.denied}</p>
        ) : nearest.length ? (
          <ul className="grid gap-3 sm:grid-cols-3">
            {nearest.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/neighborhoods/${h.slug}`}
                  className="flex h-full flex-col rounded-2xl border bg-card p-4 transition-colors hover:border-foreground"
                >
                  <span className="font-display text-xl">{h.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {labels.away.replace("{distance}", h.miles.toFixed(1))} · {h.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
