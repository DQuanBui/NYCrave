import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { EmptyState } from "@/components/brand/empty-state"
import { LineBullet } from "@/components/brand/line-bullet"
import { PlaceGrid } from "@/components/place/place-grid"
import { LINES } from "@/lib/lines"
import { getPlaces } from "@/lib/places"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/place"

export async function categoryMetadata(category: Category): Promise<Metadata> {
  const t = await getTranslations(`categories.${category}`)
  return {
    title: t("title"),
    description: t("tagline"),
    alternates: { canonical: CATEGORY_META[category].href },
  }
}

/** Shared listing for every category line. Filters and map view arrive in Phase 2. */
export async function CategoryPage({ category }: { category: Category }) {
  const t = await getTranslations()
  const meta = CATEGORY_META[category]
  const places = await getPlaces({ category }, { sort: "trending" })

  return (
    <div>
      <header className="relative overflow-hidden border-b">
        <span aria-hidden className={cn("absolute inset-x-0 top-0 h-2", LINES[meta.line].bg)} />
        <div className="mx-auto flex max-w-7xl items-end gap-5 px-4 pt-12 pb-8 lg:px-8 lg:pt-16">
          <LineBullet line={meta.line} size="xl" className="mb-1 sm:size-20 sm:text-4xl">
            {meta.bullet}
          </LineBullet>
          <div className="min-w-0 space-y-2">
            <h1 className="font-display text-display-xl">{t(`categories.${category}.title`)}</h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              {t(`categories.${category}.tagline`)}
            </p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-8">
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
          {t("listing.count", { count: places.length })}
        </p>
        {places.length ? (
          <PlaceGrid places={places} />
        ) : (
          <EmptyState
            line={meta.line}
            bullet={meta.bullet}
            title={t("listing.emptyTitle")}
            body={t("listing.emptyBody")}
          />
        )}
      </div>
    </div>
  )
}
