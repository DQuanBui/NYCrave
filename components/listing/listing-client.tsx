"use client"

import { Footprints, LocateFixed, Shuffle, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { EmptyState } from "@/components/brand/empty-state"
import { FilterBar } from "@/components/listing/filter-bar"
import { pillClass } from "@/components/listing/filter-menu"
import { LazyMap } from "@/components/map/lazy-map"
import { PagedGrid } from "@/components/listing/paged-grid"
import { CopyButton } from "@/components/place/copy-button"
import { ShareButton } from "@/components/place/share-button"
import { Button } from "@/components/ui/button"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useRouter } from "@/i18n/navigation"
import { distanceKm } from "@/lib/geo"
import { useNow } from "@/hooks/use-now"
import { applyListing, hasActiveFilters, type FilterOptions } from "@/lib/listing"
import { placeToPoint } from "@/lib/map-points"
import { listingQuery, parseListingParams, type ListingParams } from "@/lib/place-filters"
import { estimateTravel } from "@/lib/planner/estimates"
import type { Travel } from "@/lib/planner/types"
import type { CardPlace } from "@/lib/card-place"

/** A place card plus what the server worked out for filtering. */
export type ListingCard = CardPlace & { stepFree: boolean }

type ListingClientProps = {
  /** Every place in the listing; the URL's filters are applied here. */
  pool: ListingCard[]
  options: FilterOptions
}

/**
 * Filters live in the URL, so every filtered view can be shared or bookmarked.
 * Changing one rewrites the query string in place (no request to the server)
 * and the list is filtered right here.
 */
/** How many places "Copy as text" includes, so the text stays readable in a chat. */
const COPY_LIMIT = 30

/** The listing as plain text: the count and this view's link, then one place per line. */
function listingText(heading: string, places: CardPlace[], more: string) {
  const origin = window.location.origin
  return [
    `${heading}: ${window.location.href}`,
    "",
    ...places
      .slice(0, COPY_LIMIT)
      .map((p) => `• ${p.name}, ${p.neighborhood}: ${origin}/place/${p.slug}`),
    ...(places.length > COPY_LIMIT ? [more] : []),
  ].join("\n")
}

export function ListingClient({ pool, options }: ListingClientProps) {
  const searchParams = useSearchParams()
  const params = useMemo(
    () => parseListingParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  )
  return <Listing pool={pool} options={options} params={params} />
}

/**
 * The same listing with no filters, for the cached HTML: it shows until the
 * URL's filters are read, and matches the real one so nothing jumps.
 */
export function ListingFallback({ pool, options }: ListingClientProps) {
  return <Listing pool={pool} options={options} params={parseListingParams({})} />
}

function Listing({ pool, options, params }: ListingClientProps & { params: ListingParams }) {
  const t = useTranslations("filters")
  const router = useRouter()
  const now = useNow()
  const places = useMemo(() => {
    const shown = applyListing(pool, params, now ?? undefined)
    return params.step ? shown.filter((p) => p.stepFree) : shown
  }, [pool, params, now])

  const navigate = (next: Partial<ListingParams>) => {
    const query = new URLSearchParams(listingQuery(next)).toString()
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`)
  }

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
  // With Near me on: keep only what is a walk away (the same 20-minute line the
  // travel estimates use between walking and taking the train)
  const [walkOnly, setWalkOnly] = useState(false)
  const listed = origin && walkOnly ? sorted.filter((p) => travel?.[p.id].mode === "walk") : sorted

  return (
    <div className="space-y-5">
      <FilterBar
        params={params}
        options={options}
        onChange={update}
        onClear={clear}
        toggles={
          origin ? (
            <>
              <button type="button" onClick={geo.reset} aria-pressed className={pillClass(true)}>
                <LocateFixed aria-hidden className="size-4" />
                {t("nearMe")}
                <X aria-hidden className="size-3.5 opacity-70" />
              </button>
              <button
                type="button"
                aria-pressed={walkOnly}
                onClick={() => setWalkOnly((v) => !v)}
                className={pillClass(walkOnly)}
              >
                <Footprints aria-hidden className="size-4" />
                {t("walkable")}
              </button>
            </>
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
          )
        }
      />
      {geo.state.status === "denied" || farAway ? (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {geo.state.status === "denied" ? t("locationDenied") : t("locationFar")}
        </p>
      ) : null}
      <h2 className="sr-only">{t("resultsHeading")}</h2>
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
          {t("results", { count: listed.length })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {listed.length > 1 ? (
            <button
              type="button"
              onClick={() =>
                router.push(`/place/${listed[Math.floor(Math.random() * listed.length)].slug}`)
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-taxi px-3 text-sm font-bold text-taxi-foreground"
            >
              <Shuffle aria-hidden className="size-4" />
              {t("pickOne")}
            </button>
          ) : null}
          {listed.length > 0 ? (
            <CopyButton
              value={
                typeof window === "undefined"
                  ? ""
                  : listingText(
                      t("results", { count: listed.length }),
                      listed,
                      t("andMore", { count: listed.length - COPY_LIMIT }),
                    )
              }
              label={t("copyText")}
              copiedLabel={t("copiedText")}
              className="h-8 px-3 text-sm [&_svg]:size-4"
            />
          ) : null}
          {/* Filters live in the URL, so a filtered view can be passed on as is */}
          {hasActiveFilters(params) && listed.length > 0 ? (
            <ShareButton
              label={t("share")}
              className="h-8 border-foreground/15 px-3 hover:border-foreground"
            />
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        {listed.length === 0 ? (
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
                points={listed.map((p) => placeToPoint(p))}
                ariaLabel={t("mapLabel", { count: listed.length })}
                cluster
                className="h-[60vh] min-h-80"
              />
            ) : null}
            {/* A new filter or order starts again from the first page */}
            <PagedGrid
              key={`${JSON.stringify(listingQuery(params))}-${origin ? "near" : ""}-${walkOnly}`}
              places={listed}
              travel={travel}
            />
          </>
        )}
      </div>
    </div>
  )
}
