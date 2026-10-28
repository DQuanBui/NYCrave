"use client"

import { LocateFixed } from "lucide-react"
import { useTranslations } from "next-intl"
import { useGeolocation } from "@/hooks/use-geolocation"
import type { LatLng } from "@/lib/geo"
import { estimateTravel } from "@/lib/planner/estimates"

/**
 * "How far is it from me?": asks for the viewer's position only when pressed
 * and shows a rough distance and travel time. The position never leaves the
 * browser.
 */
export function HowFar({ to }: { to: LatLng }) {
  const t = useTranslations()
  const geo = useGeolocation()

  if (geo.state.status === "ready") {
    const travel = estimateTravel(geo.state.position, to)
    return (
      <div aria-live="polite" className="space-y-1 rounded-xl bg-muted p-3">
        <p className="flex items-center gap-2 font-bold">
          <LocateFixed aria-hidden className="size-4" />
          {t(travel.mode === "walk" ? "place.distanceWalk" : "place.distanceSubway", {
            distance: (travel.km / 1.609).toFixed(1),
            minutes: travel.minutes,
          })}
        </p>
        <p className="text-xs text-muted-foreground">{t("place.howFarNote")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={geo.locate}
        disabled={geo.state.status === "locating"}
        className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-foreground/15 px-4 text-sm font-semibold transition-colors hover:border-foreground"
      >
        <LocateFixed aria-hidden className="size-4" />
        {geo.state.status === "locating" ? t("filters.locating") : t("place.howFar")}
      </button>
      {geo.state.status === "denied" ? (
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {t("filters.locationDenied")}
        </p>
      ) : null}
    </div>
  )
}
