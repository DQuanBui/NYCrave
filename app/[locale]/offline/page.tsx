import { toCard } from "@/lib/card-place"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { SavedList } from "@/components/place/saved-list"
import { initLocale } from "@/i18n/locale"
import { getPlaces } from "@/lib/places"

export const metadata: Metadata = { robots: { index: false } }

/** Served by the service worker when a page is requested without a connection. */
export default async function OfflinePage({ params }: PageProps<"/[locale]/offline">) {
  await initLocale(params)
  const t = await getTranslations("offline")
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 lg:px-8">
      <header className="flex items-end gap-4">
        <LineBullet line="gray" size="xl" className="mb-1">
          !
        </LineBullet>
        <div className="space-y-2">
          <h1 className="font-display text-display-lg">{t("title")}</h1>
          <p className="max-w-xl text-lg text-muted-foreground">{t("body")}</p>
        </div>
      </header>
      <SavedList places={(await getPlaces({}, { sort: "name" })).map(toCard)} />
    </div>
  )
}
