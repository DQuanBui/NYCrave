import { getTranslations } from "next-intl/server"
import { Hero } from "@/components/home/hero"
import { LineMap } from "@/components/home/line-map"
import { MyDayPromo } from "@/components/home/my-day-promo"
import { PlaceRail } from "@/components/place/place-rail"
import { initLocale } from "@/i18n/locale"
import { holidayOn } from "@/lib/holidays"
import { nycDateString } from "@/lib/hours"
import { toCard } from "@/lib/card-place"
import { getPlaces } from "@/lib/places"
import { getRainForecast } from "@/lib/weather"
import { SITE_URL } from "@/lib/site"
import { CATEGORIES } from "@/types/enums"
import type { Category } from "@/types/place"

// Refresh listings from the database every few minutes
export const revalidate = 300

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  await initLocale(params)
  const t = await getTranslations("home")

  const [all, free, favorites] = await Promise.all([
    getPlaces({}, { sort: "trending" }),
    getPlaces({ isFree: true }, { sort: "trending" }),
    getPlaces({ vibe: "local_favorite" }, { sort: "trending" }),
  ])
  const hints = all.map((p) => ({
    slug: p.slug,
    name: p.name,
    neighborhood: p.neighborhood,
    category: p.category,
  }))
  const today = nycDateString(new Date())
  const rain = await getRainForecast(today, today)
  const forecast =
    rain && rain.tempMaxC !== null
      ? {
          tempMaxF: Math.round((rain.tempMaxC * 9) / 5 + 32),
          chance: rain.precipitationProbability,
          rainLikely: rain.rainLikely,
        }
      : null
  const counts = Object.fromEntries(
    CATEGORIES.map((c) => [c, all.filter((p) => p.category === c).length]),
  ) as Record<Category, number>

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NYCrave",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Hero hints={hints} forecast={forecast} holiday={holidayOn(today)} />
      <LineMap counts={counts} />
      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-14 lg:space-y-20 lg:px-8 lg:pt-20">
        <PlaceRail title={t("trending")} places={all.slice(0, 8).map(toCard)} limit={8} />
        <PlaceRail
          title={t("openNow")}
          places={all.map(toCard)}
          live="open-now"
          surprise
          seeAllHref="/search?q=open+now"
          emptyText={t("openNowEmpty")}
        />
        <MyDayPromo />
        <PlaceRail
          title={t("freeToday")}
          places={free.map(toCard)}
          live="free-today"
          seeAllHref="/search?q=free+today"
          emptyText={t("freeTodayEmpty")}
        />
        <PlaceRail
          title={t("localFavorites")}
          places={favorites.slice(0, 10).map(toCard)}
          seeAllHref="/search?q=local+favorites"
        />
      </div>
    </>
  )
}
