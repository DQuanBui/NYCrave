import { ListingClient } from "@/components/listing/listing-client"
import { toCard } from "@/lib/card-place"
import { applyListing, filterOptions } from "@/lib/listing"
import { parseListingParams, type PlaceFilter } from "@/lib/place-filters"
import { getPlaces } from "@/lib/places"

type RawParams = Record<string, string | string[] | undefined>

/** A filterable list/map of places within a base set (a category, a cuisine, …). */
export async function ListingView({
  base,
  searchParams,
}: {
  base: PlaceFilter
  searchParams: Promise<RawParams>
}) {
  const params = parseListingParams(await searchParams)
  const pool = await getPlaces(base)
  return (
    <ListingClient
      places={applyListing(pool, params).map(toCard)}
      params={params}
      options={filterOptions(pool)}
    />
  )
}
