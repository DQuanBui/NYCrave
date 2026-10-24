import { ShareButton } from "@/components/place/share-button"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { SectionHeader } from "@/components/listing/section-header"
import { RideStops } from "@/components/subway/ride-stops"
import { LazyMap } from "@/components/map/lazy-map"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { toCard } from "@/lib/card-place"
import { placeToPoint } from "@/lib/map-points"
import { getPlaces } from "@/lib/places"
import { MAX_WALK, RIDE_ROUTES, rideLine, routeFromSlug, routeSlug } from "@/lib/ride"
import { ROUTE_LINE } from "@/lib/subway"

type Props = PageProps<"/[locale]/subway/[route]">

export const revalidate = 86400

export function generateStaticParams() {
  return RIDE_ROUTES.map((r) => ({ route: routeSlug(r) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const route = routeFromSlug((await params).route)
  if (!route) return {}
  const t = await getTranslations("ride")
  return {
    title: t("lineTitle", { route }),
    description: t("tagline"),
    alternates: { canonical: `/subway/${routeSlug(route)}` },
  }
}

export default async function RidePage({ params }: Props) {
  await initLocale(params)
  const route = routeFromSlug((await params).route)
  if (!route) notFound()

  const t = await getTranslations()
  const r = await getTranslations("ride")
  const ride = rideLine(route, (await getPlaces({}, { sort: "trending" })).map(toCard))
  const color = ROUTE_LINE[route]
  const first = ride.stops[0].station.name
  const last = ride.stops.at(-1)!.station.name

  const others = RIDE_ROUTES.filter((o) => o !== route && ROUTE_LINE[o] === color)

  return (
    <div>
      <SectionHeader
        line={color}
        bullet={route}
        title={r("lineTitle", { route })}
        tagline={r("lineTagline", {
          count: ride.placeCount,
          minutes: MAX_WALK,
          from: first,
          to: last,
        })}
        back={{ href: "/subway", label: r("title") }}
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 lg:px-8">
        <ShareButton className="-mb-4" />
        <LazyMap
          ariaLabel={r("mapLabel", { route })}
          className="h-72 sm:h-96"
          points={[
            ...ride.stops.map((stop) => ({
              id: `station-${stop.station.name}-${stop.station.lat}`,
              lat: stop.station.lat,
              lng: stop.station.lng,
              name: stop.station.name,
              subtitle: stop.places.length
                ? t("ride.count", { count: stop.places.length })
                : undefined,
              line: color,
              label: route,
            })),
            ...ride.stops.flatMap((stop) => stop.places.map(({ place }) => placeToPoint(place))),
          ]}
        />
        <RideStops
          color={color}
          stops={ride.stops.map(({ station, places }) => ({
            station: { name: station.name, ada: station.ada },
            places,
          }))}
        />
        <p className="max-w-prose text-sm text-muted-foreground">
          {r("accessibleNote")} {r("note")}
        </p>
        {others.length ? (
          <nav aria-label={r("sameLine")} className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold">{r("sameLine")}</span>
            {others.map((o) => (
              <Link
                key={o}
                href={`/subway/${routeSlug(o)}`}
                aria-label={r("lineTitle", { route: o })}
              >
                <LineBullet line={color} size="md">
                  {o}
                </LineBullet>
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </div>
  )
}
