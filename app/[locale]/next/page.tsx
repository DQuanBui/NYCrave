import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SectionHeader } from "@/components/listing/section-header"
import { WhatsNextView } from "@/components/next/whats-next-view"
import { initLocale } from "@/i18n/locale"
import { toCard } from "@/lib/card-place"
import { getPlaces } from "@/lib/places"

type Props = PageProps<"/[locale]/next">

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("next")
  return { title: t("title"), description: t("tagline"), alternates: { canonical: "/next" } }
}

export default async function WhatsNextPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("next")
  const places = (await getPlaces({}, { sort: "trending" })).map((p) => ({
    ...toCard(p),
    trendingScore: p.trendingScore,
  }))
  return (
    <div>
      <SectionHeader line="green" bullet="→" title={t("title")} tagline={t("tagline")} />
      <WhatsNextView places={places} />
    </div>
  )
}
