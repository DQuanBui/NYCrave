import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SectionHeader } from "@/components/listing/section-header"
import { WalksView, type WalkCard } from "@/components/walks/walks-view"
import { WALKS } from "@/data/walks"
import { initLocale } from "@/i18n/locale"
import { getPlaces } from "@/lib/places"
import { nearestStations } from "@/lib/subway"
import { walkMinutesFor } from "@/lib/walks"

type Props = PageProps<"/[locale]/walks">

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("walks")
  return { title: t("title"), description: t("tagline"), alternates: { canonical: "/walks" } }
}

export default async function WalksPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("walks")
  const places = new Map((await getPlaces()).map((p) => [p.slug, p]))

  const cards: WalkCard[] = WALKS.map((walk) => {
    const place = walk.place ? places.get(walk.place) : undefined
    // Walks without their own photo borrow the matching place's first one
    const photo = walk.photo ?? place?.photos[0]
    const station = nearestStations(walk.start, 1, 20)[0]
    return {
      ...walk,
      photo,
      placeSlug: place?.slug,
      minutes: walkMinutesFor(walk),
      station: station
        ? { name: station.name, routes: station.routes, walkMinutes: station.walkMinutes }
        : null,
    }
  })

  return (
    <div>
      <SectionHeader line="green" bullet="🥾" title={t("title")} tagline={t("tagline")} />
      <WalksView walks={cards} />
    </div>
  )
}
