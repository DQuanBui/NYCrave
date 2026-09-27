import { getTranslations } from "next-intl/server"
import { Hero } from "@/components/home/hero"
import { LineMap } from "@/components/home/line-map"
import { MyDayPromo } from "@/components/home/my-day-promo"
import { PlaceRail } from "@/components/place/place-rail"
import { initLocale } from "@/i18n/locale"
import { getPlaces } from "@/lib/places"
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
      <Hero />
      <LineMap counts={counts} />
      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-14 lg:space-y-20 lg:px-8 lg:pt-20">
        <PlaceRail title={t("trending")} places={all} limit={8} />
        <PlaceRail
          title={t("openNow")}
          places={all}
          live="open-now"
          seeAllHref="/search?q=open+now"
          emptyText={t("openNowEmpty")}
        />
        <MyDayPromo />
        <PlaceRail
          title={t("freeToday")}
          places={free}
          live="free-today"
          seeAllHref="/search?q=free+today"
          emptyText={t("freeTodayEmpty")}
        />
        <PlaceRail
          title={t("localFavorites")}
          places={favorites}
          seeAllHref="/search?q=local+favorites"
        />
      </div>
    </>
  )
}
