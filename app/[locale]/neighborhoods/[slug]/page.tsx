import { Route } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { EmptyState } from "@/components/brand/empty-state"
import { LineBullet } from "@/components/brand/line-bullet"
import { SectionHeader } from "@/components/listing/section-header"
import { LazyMap } from "@/components/map/lazy-map"
import { PlaceGrid } from "@/components/place/place-grid"
import { RouteBullets } from "@/components/place/subway-list"
import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { distanceKm } from "@/lib/geo"
import { placeToPoint } from "@/lib/map-points"
import { getPlaces } from "@/lib/places"
import { routesNear } from "@/lib/subway"
import { BOROUGH_META, CATEGORY_META } from "@/lib/taxonomy"
import { CATEGORIES } from "@/types/enums"

type Props = PageProps<"/[locale]/neighborhoods/[slug]">

export const revalidate = 300

export function generateStaticParams() {
  return NEIGHBORHOODS.map((n) => ({ slug: n.slug }))
}

const blurbKey = (slug: string) =>
  `neighborhoods.blurbs.${slug}` as "neighborhoods.blurbs.chinatown"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const { slug } = await params
  const hood = NEIGHBORHOODS.find((n) => n.slug === slug)
  if (!hood) return {}
  const t = await getTranslations()
  return {
    title: hood.name,
    description: t(blurbKey(hood.slug)),
    alternates: { canonical: `/neighborhoods/${hood.slug}` },
  }
}

export default async function NeighborhoodPage({ params }: Props) {
  await initLocale(params)
  const { slug } = await params
  const hood = NEIGHBORHOODS.find((n) => n.slug === slug)
  if (!hood) notFound()

  const t = await getTranslations()
  const all = await getPlaces({}, { sort: "trending" })
  const places = all.filter((p) => p.neighborhood === hood.name)
  const meta = BOROUGH_META[hood.borough]
  const routes = routesNear(hood, 0.6)

  // Closest neighborhoods that actually have places
  const nearby = NEIGHBORHOODS.filter((n) => n.slug !== hood.slug)
    .map((n) => ({
      ...n,
      km: distanceKm(hood, n),
      count: all.filter((p) => p.neighborhood === n.name).length,
    }))
    .filter((n) => n.count > 0)
    .sort((a, b) => a.km - b.km)
    .slice(0, 4)

  return (
    <div>
      <SectionHeader
        line={meta.line}
        bullet={meta.bullet}
        title={hood.name}
        tagline={t(blurbKey(hood.slug))}
        back={{ href: "/neighborhoods", label: t("neighborhoods.title") }}
      />
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold text-muted-foreground">
            {t(`borough.${hood.borough}`)}, {t("neighborhoods.count", { count: places.length })}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {CATEGORIES.filter((c) => places.some((p) => p.category === c)).map((c) => (
              <li
                key={c}
                className="flex items-center gap-1.5 rounded-full bg-muted py-0.5 pr-3 pl-1 text-sm font-semibold"
              >
                <LineBullet line={CATEGORY_META[c].line} size="xs">
                  {CATEGORY_META[c].bullet}
                </LineBullet>
                {places.filter((p) => p.category === c).length} {t(`categories.${c}.title`)}
              </li>
            ))}
          </ul>
          <Link
            href={{ pathname: "/my-day", query: { from: hood.slug } }}
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-full bg-taxi px-5 text-sm font-bold text-taxi-foreground"
          >
            <Route aria-hidden className="size-4" />
            {t("neighborhoods.planDay")}
          </Link>
        </div>
        {routes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-bold text-muted-foreground">{t("subway.linesHere")}</h2>
            <RouteBullets routes={routes} size="md" />
          </div>
        ) : null}

        {places.length ? (
          <>
            <section aria-labelledby="places-in" className="space-y-5">
              <h2 id="places-in" className="font-display text-display-md">
                {t("neighborhoods.placesIn", { name: hood.name })}
              </h2>
              <PlaceGrid places={places} />
            </section>
            <LazyMap
              points={places.map((p) => placeToPoint(p))}
              ariaLabel={t("neighborhoods.mapLabel", { name: hood.name })}
              className="h-72 sm:h-96"
            />
          </>
        ) : (
          <EmptyState
            line={meta.line}
            bullet={meta.bullet}
            title={t("neighborhoods.emptyTitle")}
            body={t("neighborhoods.emptyBody", { name: hood.name })}
          />
        )}

        {nearby.length ? (
          <section aria-labelledby="nearby" className="space-y-4">
            <h2 id="nearby" className="font-display text-display-sm sm:text-3xl">
              {t("neighborhoods.nearby")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {nearby.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/neighborhoods/${n.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-transparent bg-card px-4 py-2 font-semibold hover:border-foreground"
                  >
                    {n.name}
                    <span className="text-xs text-muted-foreground">
                      {t("neighborhoods.count", { count: n.count })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}
