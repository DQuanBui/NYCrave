import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"
import { SavedList } from "@/components/place/saved-list"
import { SharedFromLink } from "@/components/place/shared-list"
import { SavedDays } from "@/components/planner/saved-days"
import { initLocale } from "@/i18n/locale"
import { toCard } from "@/lib/card-place"
import { getPlaces } from "@/lib/places"

type Props = PageProps<"/[locale]/saved">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("saved")
  return { title: t("title"), robots: { index: false } }
}

// Saved places live on the device, so the page itself is the same for everyone
export const revalidate = 86400

export default async function SavedPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("saved")
  const places = (await getPlaces({}, { sort: "name" })).map(toCard)

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
      <h1 className="font-display text-display-xl">{t("title")}</h1>
      <Suspense fallback={null}>
        <SharedFromLink places={places} />
      </Suspense>
      <SavedList places={places} />
      <SavedDays />
    </div>
  )
}
