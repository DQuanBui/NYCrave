import { getTranslations } from "next-intl/server"
import { ComingUp } from "@/components/home/coming-up"
import { Hero } from "@/components/home/hero"
import { LineMap } from "@/components/home/line-map"
import { MyDayPromo } from "@/components/home/my-day-promo"
import { PlaceRail } from "@/components/place/place-rail"
import { initLocale } from "@/i18n/locale"
import { holidayOn } from "@/lib/holidays"
import { getOpenStatus, isOpenLaterToday, nycClock, nycDateString } from "@/lib/hours"
import { toCard } from "@/lib/card-place"
import { getPlaces } from "@/lib/places"
import { upcomingSeasons } from "@/lib/seasons"
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
  const now = new Date()
  const today = nycDateString(now)
  // The live rails re-check against the viewer's clock. The server sends a short
  // list of likely matches (the page is regenerated every few minutes), so the
  // home page does not carry every place's weekly hours.
  const clock = nycClock(now)
  const LIVE_CANDIDATES = 20
  const openCandidates = all
    .filter((p) => {
      const { state } = getOpenStatus(p.hours, now)
      return state !== "closed" && state !== "closed_indefinitely"
    })
    .slice(0, LIVE_CANDIDATES)
  const freeCandidates = free
    .filter((p) => isOpenLaterToday(p.hours, clock))
    .slice(0, LIVE_CANDIDATES)
  const rain = await getRainForecast(today, today)
  const forecast =
    rain && rain.tempMaxC !== null
      ? {
          tempMaxF: Math.round((rain.tempMaxC * 9) / 5 + 32),
          chance: rain.precipitationProbability,
          rainLikely: rain.rainLikely,
          extreme: rain.extreme,
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
        <ComingUp seasons={upcomingSeasons(today).slice(0, 3)} />
        <PlaceRail
          title={t("openNow")}
          places={openCandidates.map(toCard)}
          live="open-now"
          surprise
          seeAllHref="/search?q=open+now"
          emptyText={t("openNowEmpty")}
        />
        <MyDayPromo />
        <PlaceRail
          title={t("freeToday")}
          places={freeCandidates.map(toCard)}
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
