import { toCard } from "@/lib/card-place"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SavedList } from "@/components/place/saved-list"
import { SavedDays } from "@/components/planner/saved-days"
import { initLocale } from "@/i18n/locale"
import { getPlaces } from "@/lib/places"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/saved">): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("saved")
  return { title: t("title"), robots: { index: false } }
}

export default async function SavedPage({ params }: PageProps<"/[locale]/saved">) {
  await initLocale(params)
  const t = await getTranslations("saved")
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
      <h1 className="font-display text-display-xl">{t("title")}</h1>
      <SavedList places={(await getPlaces({}, { sort: "name" })).map(toCard)} />
      <SavedDays />
    </div>
  )
}
