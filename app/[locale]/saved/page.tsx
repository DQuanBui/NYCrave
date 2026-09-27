import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SavedList } from "@/components/place/saved-list"
import { SharedList } from "@/components/place/shared-list"
import { SavedDays } from "@/components/planner/saved-days"
import { initLocale } from "@/i18n/locale"
import { toCard } from "@/lib/card-place"
import { getPlaces } from "@/lib/places"
import { MAX_SHARED } from "@/lib/shared-list"

type Props = PageProps<"/[locale]/saved">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("saved")
  return { title: t("title"), robots: { index: false } }
}

export default async function SavedPage({ params, searchParams }: Props) {
  await initLocale(params)
  const t = await getTranslations("saved")
  const places = (await getPlaces({}, { sort: "name" })).map(toCard)

  // ?list=slug,slug from a shared link; unknown slugs are ignored
  const raw = (await searchParams).list
  const wanted = (Array.isArray(raw) ? raw[0] : raw)?.split(",").slice(0, MAX_SHARED) ?? []
  const shared = wanted
    .map((slug) => places.find((p) => p.slug === slug))
    .filter((p) => p !== undefined)

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
      <h1 className="font-display text-display-xl">{t("title")}</h1>
      {shared.length ? <SharedList places={shared} /> : null}
      {shared.length ? <h2 className="font-display text-display-md">{t("yours")}</h2> : null}
      <SavedList places={places} />
      <SavedDays />
    </div>
  )
}
