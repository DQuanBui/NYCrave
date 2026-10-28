"use client"

import { LocateFixed, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"
import { createContext, useContext, type ReactNode } from "react"
import { pillClass } from "@/components/listing/filter-menu"
import { useGeolocation, type GeoState } from "@/hooks/use-geolocation"
import { Link } from "@/i18n/navigation"
import { distanceKm, type LatLng } from "@/lib/geo"

/**
 * "Near me" for the New York menu: one button asks for the viewer's position
 * (only when pressed), and every dish lists its places nearest first. The
 * position never leaves the browser.
 */
const NearMeContext = createContext<{
  state: GeoState
  locate: () => void
  reset: () => void
} | null>(null)

export function FoodNearMeProvider({ children }: { children: ReactNode }) {
  const { state, locate, reset } = useGeolocation()
  return (
    <NearMeContext.Provider value={{ state, locate, reset }}>{children}</NearMeContext.Provider>
  )
}

export function FoodNearMeButton() {
  const t = useTranslations("filters")
  const ctx = useContext(NearMeContext)
  if (!ctx) return null
  const { state, locate, reset } = ctx
  const on = state.status === "ready"
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-pressed={on}
        onClick={on ? reset : locate}
        disabled={state.status === "locating"}
        className={pillClass(on)}
      >
        <LocateFixed aria-hidden className="size-4" />
        {state.status === "locating" ? t("locating") : t("nearMe")}
      </button>
      {state.status === "denied" ? (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {t("locationDenied")}
        </p>
      ) : null}
    </div>
  )
}

export type WherePlace = LatLng & { slug: string; name: string; neighborhood: string }

/** Where to try a dish: as listed, or nearest first with distances once "Near me" is on. */
export function WhereToTry({ places }: { places: WherePlace[] }) {
  const t = useTranslations("filters")
  const ctx = useContext(NearMeContext)
  const origin = ctx?.state.status === "ready" ? ctx.state.position : null
  const shown = origin
    ? places.map((p) => ({ ...p, km: distanceKm(origin, p) })).sort((a, b) => a.km - b.km)
    : places.map((p) => ({ ...p, km: null }))

  return (
    <ul className="flex flex-wrap gap-2">
      {shown.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/place/${p.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-transparent bg-muted px-3 py-1.5 text-sm font-semibold transition-colors hover:border-foreground"
          >
            <MapPin aria-hidden className="size-3.5" />
            {p.name}
            <span className="font-normal text-muted-foreground">
              {p.km === null
                ? p.neighborhood
                : t("milesAway", { distance: (p.km / 1.609).toFixed(1) })}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
