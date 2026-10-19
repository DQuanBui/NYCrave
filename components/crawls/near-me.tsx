"use client"

import { LocateFixed, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"
import { createContext, useContext, type ReactNode } from "react"
import { useGeolocation, type GeoState } from "@/hooks/use-geolocation"
import type { LatLng } from "@/lib/geo"
import { estimateTravel } from "@/lib/planner/estimates"
import { cn } from "@/lib/utils"

/**
 * "Near me" for the crawls page: one button asks for the viewer's position (only
 * when pressed), and every crawl shows how far its first stop is. The position
 * never leaves the browser.
 */
const NearMeContext = createContext<{ state: GeoState; locate: () => void } | null>(null)

export function NearMeProvider({ children }: { children: ReactNode }) {
  const { state, locate } = useGeolocation()
  return <NearMeContext.Provider value={{ state, locate }}>{children}</NearMeContext.Provider>
}

export function NearMeButton({ className }: { className?: string }) {
  const t = useTranslations("crawls")
  const ctx = useContext(NearMeContext)
  if (!ctx) return null
  const { state, locate } = ctx
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <button
        type="button"
        onClick={locate}
        disabled={state.status === "locating"}
        aria-pressed={state.status === "ready"}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
          state.status === "ready"
            ? "border-foreground bg-foreground text-background"
            : "border-foreground/15 bg-card hover:border-foreground",
        )}
      >
        <LocateFixed aria-hidden className="size-4" />
        {t(state.status === "locating" ? "locating" : "nearMe")}
      </button>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {state.status === "denied" ? t("denied") : state.status === "ready" ? t("nearMeOn") : null}
      </p>
    </div>
  )
}

/** How far the crawl's first stop is from the viewer, once they share their position. */
export function CrawlDistance({ start }: { start: LatLng }) {
  const t = useTranslations("crawls")
  const ctx = useContext(NearMeContext)
  if (ctx?.state.status !== "ready") return null
  const travel = estimateTravel(ctx.state.position, start)
  return (
    <p className="flex items-center gap-1.5 text-sm font-semibold">
      <MapPin aria-hidden className="size-4 text-line-red" />
      {t(travel.mode === "walk" ? "fromYouWalk" : "fromYouSubway", { minutes: travel.minutes })}
    </p>
  )
}
