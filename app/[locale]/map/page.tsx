import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { CityMap } from "@/components/map/city-map"
import { initLocale } from "@/i18n/locale"
import { toCard } from "@/lib/card-place"
import { getPlaces } from "@/lib/places"

type Props = PageProps<"/[locale]/map">

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("cityMap")
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/map" },
  }
}

export default async function MapPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("cityMap")
  const places = (await getPlaces({}, { sort: "trending" })).map(toCard)
  return (
    <>
      <h1 className="sr-only">{t("title")}</h1>
      <CityMap places={places} />
    </>
  )
}
