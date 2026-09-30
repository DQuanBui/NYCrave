import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { SectionHeader } from "@/components/listing/section-header"
import { PlacePhoto } from "@/components/place/place-photo"
import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { toCard } from "@/lib/card-place"
import { LINES } from "@/lib/lines"
import { getPlaces } from "@/lib/places"
import { BOROUGH_META, CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { BOROUGHS, CATEGORIES } from "@/types/enums"

type Props = PageProps<"/[locale]/neighborhoods">

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("neighborhoods")
  return {
    title: t("title"),
    description: t("tagline"),
    alternates: { canonical: "/neighborhoods" },
  }
}

export default async function NeighborhoodsPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations()
  const places = await getPlaces({}, { sort: "trending" })
  const inHood = (name: string) => places.filter((p) => p.neighborhood === name)
  const count = (name: string) => inHood(name).length
  /** Best-known places with photos first, for covers and thumbnails. */
  const withPhotos = (name: string) => inHood(name).filter((p) => p.photos.length > 0)
  /** A real photo of the neighborhood itself: views, parks and landmarks before food. */
  const SCENERY = ["photo_spot", "park_pier", "attraction", "shopping", "drink", "restaurant"]
  const coverFor = (name: string) => {
    const real = withPhotos(name).filter((p) => !p.photos[0].illustrative)
    const pool = real.length ? real : withPhotos(name)
    return [...pool].sort((a, b) => SCENERY.indexOf(a.category) - SCENERY.indexOf(b.category))[0]
  }
  /** The lines (categories) you can ride in a neighborhood, in the site's order. */
  const linesIn = (name: string) =>
    CATEGORIES.filter((c) => inHood(name).some((p) => p.category === c))

  return (
    <div>
      <SectionHeader
        line="green"
        bullet="N"
        title={t("neighborhoods.title")}
        tagline={t("neighborhoods.tagline")}
      />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 lg:px-8">
        {BOROUGHS.map((borough) => {
          const meta = BOROUGH_META[borough]
          const hoods = NEIGHBORHOODS.filter((n) => n.borough === borough).sort(
            (a, b) => count(b.name) - count(a.name) || a.name.localeCompare(b.name),
          )
          return (
            <section key={borough} aria-labelledby={`borough-${borough}`} className="space-y-4">
              <h2
                id={`borough-${borough}`}
                className="flex items-center gap-3 font-display text-display-md"
              >
                <LineBullet line={meta.line} size="md">
                  {meta.bullet}
                </LineBullet>
                {t(`borough.${borough}`)}
              </h2>
              {/* The three busiest neighborhoods with photos lead as picture cards */}
              <HoodCards
                featured={hoods.filter((n) => withPhotos(n.name).length > 0).slice(0, 3)}
                all={hoods}
                render={(n, featured) => {
                  const c = count(n.name)
                  const photos = withPhotos(n.name)
                  return featured ? (
                    <Link
                      href={`/neighborhoods/${n.slug}`}
                      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-lg"
                    >
                      <div className="relative aspect-[16/10]">
                        <PlacePhoto
                          place={toCard(coverFor(n.name))}
                          sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 100vw"
                          showChip={false}
                          className="absolute inset-0 transition-transform duration-700 ease-(--ease-out-quint) group-hover:scale-[1.05]"
                        />
                        <span
                          aria-hidden
                          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
                        />
                        <span className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2 text-white">
                          <span className="font-display text-3xl leading-none">{n.name}</span>
                          <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs font-semibold tabular-nums">
                            {t("neighborhoods.count", { count: c })}
                          </span>
                        </span>
                      </div>
                      <span aria-hidden className={cn("draw-on-view h-1.5", LINES[meta.line].bg)} />
                      <span className="flex flex-1 flex-col gap-3 p-4">
                        <span className="text-sm leading-relaxed text-muted-foreground">
                          {t(`neighborhoods.blurbs.${n.slug}` as "neighborhoods.blurbs.chinatown")}
                        </span>
                        <HoodLines categories={linesIn(n.name)} />
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href={`/neighborhoods/${n.slug}`}
                      className={cn(
                        "group flex h-full gap-3 rounded-xl border-l-8 bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
                        LINES[meta.line].border,
                      )}
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-lg font-bold">{n.name}</span>
                          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                            {t("neighborhoods.count", { count: c })}
                          </span>
                        </span>
                        <span className="text-sm leading-relaxed text-muted-foreground">
                          {t(`neighborhoods.blurbs.${n.slug}` as "neighborhoods.blurbs.chinatown")}
                        </span>
                        <HoodLines categories={linesIn(n.name)} className="mt-auto pt-1" />
                      </span>
                      {photos.length ? (
                        <span aria-hidden className="flex shrink-0 flex-col -space-y-3 pt-1">
                          {photos.slice(0, 3).map((p, i) => (
                            <PlacePhoto
                              key={p.slug}
                              place={toCard(p)}
                              sizes="48px"
                              showChip={false}
                              className={cn(
                                "size-12 rounded-full ring-3 ring-card transition-transform duration-300",
                                i === 0 && "group-hover:-translate-x-1.5",
                                i === 2 && "group-hover:translate-x-1.5",
                              )}
                            />
                          ))}
                        </span>
                      ) : null}
                    </Link>
                  )
                }}
              />
            </section>
          )
        })}
      </div>
    </div>
  )
}

type Hood = (typeof NEIGHBORHOODS)[number]

/** Picture cards for the featured neighborhoods, then compact cards for the rest. */
function HoodCards({
  featured,
  all,
  render,
}: {
  featured: Hood[]
  all: Hood[]
  render: (n: Hood, featured: boolean) => React.ReactNode
}) {
  const rest = all.filter((n) => !featured.includes(n))
  return (
    <>
      {featured.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((n) => (
            <li key={n.slug}>{render(n, true)}</li>
          ))}
        </ul>
      ) : null}
      {rest.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((n) => (
            <li key={n.slug}>{render(n, false)}</li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

/** Small line bullets for the kinds of places in a neighborhood. */
function HoodLines({
  categories,
  className,
}: {
  categories: (typeof CATEGORIES)[number][]
  className?: string
}) {
  if (!categories.length) return null
  return (
    <span aria-hidden className={cn("flex flex-wrap gap-1", className)}>
      {categories.map((c) => (
        <LineBullet key={c} line={CATEGORY_META[c].line} size="xs">
          {CATEGORY_META[c].bullet}
        </LineBullet>
      ))}
    </span>
  )
}
