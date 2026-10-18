import { Accessibility, Footprints } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { SectionHeader } from "@/components/listing/section-header"
import { LazyMap } from "@/components/map/lazy-map"
import { PlacePhoto } from "@/components/place/place-photo"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { toCard } from "@/lib/card-place"
import { LINES } from "@/lib/lines"
import { placeToPoint } from "@/lib/map-points"
import { getPlaces } from "@/lib/places"
import { MAX_WALK, RIDE_ROUTES, rideLine, routeFromSlug, routeSlug } from "@/lib/ride"
import { ROUTE_LINE } from "@/lib/subway"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"

type Props = PageProps<"/[locale]/subway/[route]">

export const revalidate = 300

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
  const line = LINES[color]
  const first = ride.stops[0].station.name
  const last = ride.stops.at(-1)!.station.name

  // Runs of stations with nothing nearby fold into one quiet row
  type Row =
    | { kind: "stop"; stop: (typeof ride.stops)[number]; end: boolean }
    | { kind: "run"; names: string[] }
  const rows: Row[] = []
  ride.stops.forEach((stop, i) => {
    const end = i === 0 || i === ride.stops.length - 1
    if (stop.places.length || end) return rows.push({ kind: "stop", stop, end })
    const prev = rows.at(-1)
    if (prev?.kind === "run") prev.names.push(stop.station.name)
    else rows.push({ kind: "run", names: [stop.station.name] })
  })
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
        <ol className="relative">
          <span
            aria-hidden
            className={cn(
              "draw-on-view-y absolute top-5 bottom-5 left-[1.05rem] w-2.5 rounded-full",
              line.bg,
            )}
          />
          {rows.map((row, i) =>
            row.kind === "run" ? (
              <li key={`run-${i}`} className="relative flex gap-4 py-3 pl-1">
                <span aria-hidden className="flex w-8 shrink-0 flex-col items-center gap-1.5 py-1">
                  {row.names.slice(0, 3).map((n) => (
                    <span key={n} className="relative size-2 rounded-full bg-background" />
                  ))}
                </span>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">
                    {r("moreStops", { count: row.names.length })}:
                  </span>{" "}
                  {row.names.join(" · ")}
                </p>
              </li>
            ) : (
              <li key={row.stop.station.name + i} className="relative flex gap-4 py-4">
                <span
                  aria-hidden
                  className={cn(
                    "pop-on-view relative z-10 mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border-4 bg-background",
                    row.stop.places.length ? "border-foreground" : "border-muted-foreground/60",
                  )}
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <h2
                    className={cn(
                      "font-display leading-tight",
                      row.end ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
                    )}
                  >
                    {row.stop.station.name}
                    {row.stop.station.ada ? (
                      <Accessibility
                        role="img"
                        aria-label={t("subway.accessible")}
                        className="ml-2 inline size-5 align-middle text-line-blue dark:text-sky-300"
                      />
                    ) : null}
                    {row.stop.places.length ? (
                      <span className="ml-2 align-middle font-sans text-sm font-semibold text-muted-foreground">
                        {t("ride.count", { count: row.stop.places.length })}
                      </span>
                    ) : null}
                  </h2>
                  {row.stop.places.length ? (
                    <ul className="-mr-4 scrollbar-none flex gap-3 overflow-x-auto pr-4 pb-1 sm:mr-0 sm:grid sm:grid-cols-2 sm:pr-0 lg:grid-cols-3">
                      {row.stop.places.map(({ place, walk }) => (
                        <li key={place.slug} className="w-56 shrink-0 sm:w-auto">
                          <Link
                            href={`/place/${place.slug}`}
                            className="group flex h-full items-center gap-3 rounded-2xl border bg-card p-2 pr-3 transition-colors hover:border-foreground"
                          >
                            <PlacePhoto
                              place={place}
                              sizes="64px"
                              showChip={false}
                              className="size-16 shrink-0 rounded-xl"
                            />
                            <span className="min-w-0">
                              <span className="line-clamp-2 leading-snug font-semibold">
                                {place.name}
                              </span>
                              <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <LineBullet line={CATEGORY_META[place.category].line} size="xs">
                                  {CATEGORY_META[place.category].bullet}
                                </LineBullet>
                                <Footprints aria-hidden className="size-3.5" />
                                {r("walk", { minutes: walk })}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ),
          )}
        </ol>
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
