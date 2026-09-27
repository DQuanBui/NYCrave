"use client"

import { useTranslations } from "next-intl"
import { useTransition } from "react"
import { EmptyState } from "@/components/brand/empty-state"
import { FilterBar } from "@/components/listing/filter-bar"
import { LazyMap } from "@/components/map/lazy-map"
import { PlaceGrid } from "@/components/place/place-grid"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "@/i18n/navigation"
import type { FilterOptions } from "@/lib/listing"
import { placeToPoint } from "@/lib/map-points"
import { listingQuery, type ListingParams } from "@/lib/place-filters"
import { cn } from "@/lib/utils"
import type { Place } from "@/types/place"

type ListingClientProps = {
  places: Place[]
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

  return (
    <div className="space-y-5">
      <FilterBar params={params} options={options} onChange={update} onClear={clear} />
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
                points={places.map((p) => placeToPoint(p))}
                ariaLabel={t("mapLabel", { count: places.length })}
                className="h-[60vh] min-h-80"
              />
            ) : null}
            <PlaceGrid places={places} />
          </>
        )}
      </div>
    </div>
  )
}
