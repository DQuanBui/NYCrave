"use client"

import { LocateFixed, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useTransition } from "react"
import { EmptyState } from "@/components/brand/empty-state"
import { FilterBar } from "@/components/listing/filter-bar"
import { pillClass } from "@/components/listing/filter-menu"
import { LazyMap } from "@/components/map/lazy-map"
import { PlaceGrid } from "@/components/place/place-grid"
import { Button } from "@/components/ui/button"
import { useGeolocation } from "@/hooks/use-geolocation"
import { usePathname, useRouter } from "@/i18n/navigation"
import { distanceKm } from "@/lib/geo"
import type { FilterOptions } from "@/lib/listing"
import { placeToPoint } from "@/lib/map-points"
import { listingQuery, type ListingParams } from "@/lib/place-filters"
import { estimateTravel } from "@/lib/planner/estimates"
import type { Travel } from "@/lib/planner/types"
import { cn } from "@/lib/utils"
import type { CardPlace } from "@/lib/card-place"

type ListingClientProps = {
  places: CardPlace[]
  params: ListingParams
  options: FilterOptions
}

/**
 * Filters live in the URL: changing one replaces the query string and the server
 * re-renders the results, so every filtered view can be shared or bookmarked.
 */
export function ListingClient({ places, params, options }: ListingClientProps) {
  const t = useTranslations("filters")
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  const navigate = (next: Partial<ListingParams>) =>
    startTransition(() =>
      router.replace({ pathname, query: listingQuery(next) }, { scroll: false }),
    )

  const update = (patch: Partial<ListingParams>) => navigate({ ...params, ...patch })
  const clear = () => navigate({ sort: params.sort, view: params.view })

  // "Near me" reorders the server results on the device; nothing is sent anywhere
  const geo = useGeolocation()
  const origin = geo.state.status === "ready" ? geo.state.position : null
  const { sorted, travel } = useMemo(() => {
    if (!origin) return { sorted: places, travel: undefined }
    const travel: Record<string, Travel> = {}
    for (const p of places) travel[p.id] = estimateTravel(origin, p)
    return { sorted: [...places].sort((a, b) => travel[a.id].km - travel[b.id].km), travel }
  }, [places, origin])
  const farAway = origin ? distanceKm(origin, { lat: 40.73, lng: -73.95 }) > 60 : false

  return (
    <div className="space-y-5">
      <FilterBar params={params} options={options} onChange={update} onClear={clear} />
      <div className="flex flex-wrap items-center gap-2">
        {origin ? (
          <button type="button" onClick={geo.reset} aria-pressed className={pillClass(true)}>
            <LocateFixed aria-hidden className="size-4" />
            {t("nearMe")}
            <X aria-hidden className="size-3.5 opacity-70" />
          </button>
        ) : (
          <button
            type="button"
            onClick={geo.locate}
            aria-pressed={false}
            disabled={geo.state.status === "locating"}
            className={pillClass(false)}
          >
            <LocateFixed aria-hidden className="size-4" />
            {geo.state.status === "locating" ? t("locating") : t("nearMe")}
          </button>
        )}
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {geo.state.status === "denied" ? t("locationDenied") : farAway ? t("locationFar") : null}
        </p>
      </div>
      <h2 className="sr-only">{t("resultsHeading")}</h2>
      <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
        {t("results", { count: places.length })}
      </p>

      <div
        aria-busy={pending}
        className={cn("space-y-6 transition-opacity", pending && "pointer-events-none opacity-60")}
      >
        {places.length === 0 ? (
          <EmptyState
            line="orange"
            title={t("noResultsTitle")}
            body={t("noResultsBody")}
            action={
              <Button size="lg" className="rounded-full" onClick={clear}>
                {t("clear")}
              </Button>
            }
          />
        ) : (
          <>
            {params.view === "map" ? (
              <LazyMap
                points={sorted.map((p) => placeToPoint(p))}
                ariaLabel={t("mapLabel", { count: places.length })}
                className="h-[60vh] min-h-80"
              />
            ) : null}
            <PlaceGrid places={sorted} travel={travel} />
          </>
        )}
      </div>
    </div>
  )
}
