import { getTranslations } from "next-intl/server"
import { Suspense } from "react"
import { ListingClient, type ListingCard } from "@/components/listing/listing-client"
import { PlaceGrid } from "@/components/place/place-grid"
import { toCard } from "@/lib/card-place"
import { filterOptions } from "@/lib/listing"
import type { PlaceFilter } from "@/lib/place-filters"
import { getPlaces } from "@/lib/places"
import { hasStepFreeStation } from "@/lib/step-free"

/**
 * A filterable list/map of places within a base set (a category, a cuisine, …).
 *
 * The page is built once and cached: it carries every place in the set, and
 * the filters in the URL are applied in the browser. Reading the URL on the
 * server would render the page again for every visit and every filter.
 */
export async function ListingView({ base }: { base: PlaceFilter }) {
  const t = await getTranslations("filters")
  const pool = await getPlaces(base)
  // Station data stays on the server, so the step-free check is done here once
  const cards: ListingCard[] = pool.map((p) => ({ ...toCard(p), stepFree: hasStepFreeStation(p) }))

  return (
    <Suspense
      fallback={
        // In the cached HTML (and until the filters load): every place, unfiltered
        <div className="space-y-5">
          <div aria-hidden className="h-9" />
          <p className="text-sm font-semibold text-muted-foreground">
            {t("results", { count: cards.length })}
          </p>
          <PlaceGrid places={cards} />
        </div>
      }
    >
      <ListingClient pool={cards} options={filterOptions(pool)} />
    </Suspense>
  )
}
