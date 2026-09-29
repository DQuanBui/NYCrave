import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { PassportView } from "@/components/passport/passport-view"
import { initLocale } from "@/i18n/locale"
import { getPlaces } from "@/lib/places"

type Props = PageProps<"/[locale]/passport">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("passport")
  return {
    title: t("title"),
    description: t("tagline"),
    alternates: { canonical: "/passport" },
    // Stamps live on each visitor's device, so the page has nothing to index
    robots: { index: false, follow: true },
  }
}

export default async function PassportPage({ params }: Props) {
  await initLocale(params)
  const places = (await getPlaces()).map((p) => ({
    slug: p.slug,
    name: p.name,
    neighborhood: p.neighborhood,
    category: p.category,
    borough: p.borough,
  }))
  return <PassportView places={places} />
}
