import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { EmptyState } from "@/components/brand/empty-state"
import { SmartSearch } from "@/components/home/smart-search"
import { PlaceGrid } from "@/components/place/place-grid"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { SEARCH_SUGGESTIONS } from "@/lib/home"
import { nycClock } from "@/lib/hours"
import { getPlaces } from "@/lib/places"
import { parseQuery, searchPlaces, type SearchIntent } from "@/lib/search"

type Props = PageProps<"/[locale]/search">

async function readQuery(searchParams: Props["searchParams"]) {
  const { q } = await searchParams
  return (Array.isArray(q) ? q[0] : q)?.trim() ?? ""
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("search")
  const query = await readQuery(searchParams)
  return {
    title: query ? t("resultsFor", { query }) : t("title"),
    robots: { index: false },
  }
}

async function intentLabels(intent: SearchIntent): Promise<string[]> {
  const t = await getTranslations()
  return [
    ...intent.categories.map((c) => t(`categories.${c}.title`)),
    ...intent.cuisines.map((c) => t(`cuisine.${c}`)),
    ...intent.dishTypes.map((d) => t(`dish.${d}`)),
    ...intent.drinkTypes.map((d) => t(`drinkType.${d}`)),
    ...intent.shopTypes.map((s) => t(`shopType.${s}`)),
    ...intent.vibes.map((v) => t(`vibe.${v}`)),
    ...intent.dietary.map((d) => t(`dietary.${d}`)),
    ...(intent.neighborhood ? [intent.neighborhood] : []),
    ...(intent.borough ? [t(`borough.${intent.borough}`)] : []),
    ...(intent.isFree ? [t("search.free")] : []),
    ...(intent.openNow ? [t("search.openNow")] : []),
    ...(intent.openToday ? [t("search.openToday")] : []),
    ...intent.terms.map((term) => `“${term}”`),
  ]
}

export default async function SearchPage({ params, searchParams }: Props) {
  await initLocale(params)
  const t = await getTranslations("search")
  const tf = await getTranslations("filters")
  const query = await readQuery(searchParams)
  const all = await getPlaces()
  const results = query ? searchPlaces(all, query, nycClock(new Date())) : []
  const hints = all.map((p) => ({
    slug: p.slug,
    name: p.name,
    neighborhood: p.neighborhood,
    category: p.category,
  }))
  const labels = query ? await intentLabels(parseQuery(query)) : []

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-8 lg:py-12">
      <header className="space-y-5">
        <h1 className="font-display text-display-lg text-balance">
          {query ? t("resultsFor", { query }) : t("startTitle")}
        </h1>
        <SmartSearch
          key={query}
          defaultValue={query}
          autoFocus={!query}
          className="max-w-2xl"
          hints={hints}
        />
        {labels.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-muted-foreground">{t("understood")}</span>
            <ul className="flex flex-wrap gap-1.5">
              {labels.map((label) => (
                <li key={label} className="rounded-full bg-muted px-2.5 py-0.5 font-semibold">
                  {label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      {query ? (
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
          {t("count", { count: results.length })}
        </p>
      ) : null}

      {results.length > 0 ? (
        <section aria-labelledby="results">
          <h2 id="results" className="sr-only">
            {tf("resultsHeading")}
          </h2>
          <PlaceGrid places={results} />
        </section>
      ) : (
        <EmptyState
          line={query ? "red" : "yellow"}
          bullet={query ? "!" : "?"}
          title={query ? t("emptyTitle") : t("startBody")}
          body={query ? t("emptyBody", { query }) : t("suggestions")}
          action={
            <ul className="flex flex-wrap justify-center gap-2">
              {SEARCH_SUGGESTIONS.map((s) => (
                <li key={s}>
                  <Link
                    href={{ pathname: "/search", query: { q: s } }}
                    className="inline-flex h-9 items-center rounded-full border-2 border-foreground/15 bg-card px-3.5 text-sm font-semibold hover:border-foreground"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          }
        />
      )}
    </div>
  )
}
