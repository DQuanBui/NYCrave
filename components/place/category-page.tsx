import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ListingView } from "@/components/listing/listing-view"
import { NeighborhoodGrid } from "@/components/listing/neighborhood-grid"
import { SectionHeader } from "@/components/listing/section-header"
import { TypeGrid } from "@/components/listing/type-grid"
import { getPlaces } from "@/lib/places"
import { CATEGORY_META } from "@/lib/taxonomy"
import { CATEGORY_TYPE_KINDS } from "@/lib/type-browse"
import type { Category } from "@/types/place"

type RawParams = Record<string, string | string[] | undefined>

export async function categoryMetadata(category: Category): Promise<Metadata> {
  const t = await getTranslations(`categories.${category}`)
  return {
    title: t("title"),
    description: t("tagline"),
    alternates: { canonical: CATEGORY_META[category].href },
  }
}

/** Shared page for every category line: browse grids, then the filterable listing. */
export async function CategoryPage({
  category,
  searchParams,
}: {
  category: Category
  searchParams: Promise<RawParams>
}) {
  const t = await getTranslations()
  const meta = CATEGORY_META[category]
  const kinds = CATEGORY_TYPE_KINDS[category] ?? []
  const showHoods = category === "shopping"
  const pool = await getPlaces({ category }, { sort: "trending" })
  // Header prints: the most popular places' own photos first, illustrative ones last
  const prints = pool
    .flatMap((p) => p.photos.slice(0, 1))
    .sort((a, b) => Number(Boolean(a.illustrative)) - Number(Boolean(b.illustrative)))

  return (
    <div>
      <SectionHeader
        line={meta.line}
        bullet={meta.bullet}
        title={t(`categories.${category}.title`)}
        tagline={t(`categories.${category}.tagline`)}
        photos={prints}
      />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 lg:px-8 lg:py-10">
        {kinds.map((kind) => (
          <TypeGrid key={kind} kind={kind} pool={pool} />
        ))}
        {showHoods ? (
          <NeighborhoodGrid
            pool={pool}
            href={meta.href}
            line={meta.line}
            title={t("browse.shoppingNeighborhoods")}
          />
        ) : null}
        <section aria-labelledby={kinds.length ? "all-places" : undefined} className="space-y-5">
          {kinds.length ? (
            <h2 id="all-places" className="font-display text-display-md">
              {t("browse.all")}
            </h2>
          ) : null}
          <ListingView base={{ category }} searchParams={searchParams} />
        </section>
      </div>
    </div>
  )
}
