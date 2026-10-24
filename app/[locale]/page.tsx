import { getTranslations } from "next-intl/server"
import { ComingUp } from "@/components/home/coming-up"
import { GuidesTeaser } from "@/components/home/guides-teaser"
import { LiveHero, LiveHomeProvider, LiveNycNow, LiveRail } from "@/components/home/live-home"
import { LineMap } from "@/components/home/line-map"
import { MenuTeaser } from "@/components/home/menu-teaser"
import { MyDayPromo } from "@/components/home/my-day-promo"
import { RecentlyViewed } from "@/components/home/recently-viewed"
import { PlaceRail } from "@/components/place/place-rail"
import { initLocale } from "@/i18n/locale"
import { freshFirst, newest } from "@/lib/home"
import { nycDateString } from "@/lib/hours"
import { toCard } from "@/lib/card-place"
import { getPlaces } from "@/lib/places"
import { upcomingSeasons } from "@/lib/seasons"
import { sunDay } from "@/lib/sun"
import { SITE_URL } from "@/lib/site"
import { CATEGORIES } from "@/types/enums"
import type { Category } from "@/types/place"

// Refresh listings from the database every few minutes
export const revalidate = 300

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  await initLocale(params)
  const t = await getTranslations("home")

  const [all, favorites] = await Promise.all([
    getPlaces({}, { sort: "trending" }),
    getPlaces({ vibe: "local_favorite" }, { sort: "trending" }),
  ])
  const now = new Date()
  const today = nycDateString(now)
  const sun = sunDay(today)
  // Each row leads with places the rows above have not shown yet. The live rows
  // ("Open now", "Free today") come from /api/now in the browser.
  const trending = all.slice(0, 8)
  const shown = new Set(trending.map((p) => p.slug))
  const localFavorites = freshFirst(favorites, shown).slice(0, 10)
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
    <LiveHomeProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <LiveHero />
      <LiveNycNow sunrise={sun.sunrise} sunset={sun.sunset} />
      <LineMap counts={counts} />
      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-14 lg:space-y-20 lg:px-8 lg:pt-20">
        <RecentlyViewed />
        <PlaceRail title={t("trending")} places={trending.map(toCard)} limit={8} />
        <PlaceRail title={t("newest")} places={newest(all).map(toCard)} limit={12} />
        <ComingUp seasons={upcomingSeasons(today).slice(0, 3)} />
        <MenuTeaser places={all} />
        <LiveRail
          kind="open"
          title={t("openNow")}
          live="open-now"
          surprise
          seeAllHref="/search?q=open+now"
          emptyText={t("openNowEmpty")}
        />
        <MyDayPromo />
        <GuidesTeaser places={all} sun={sun} />
        <LiveRail
          kind="free"
          title={t("freeToday")}
          live="free-today"
          seeAllHref="/search?q=free+today"
          emptyText={t("freeTodayEmpty")}
        />
        <PlaceRail
          title={t("localFavorites")}
          places={localFavorites.map(toCard)}
          seeAllHref="/search?q=local+favorites"
        />
      </div>
    </LiveHomeProvider>
  )
}
