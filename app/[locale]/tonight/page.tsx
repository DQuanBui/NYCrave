import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SectionHeader } from "@/components/listing/section-header"
import { TonightView } from "@/components/tonight/tonight-view"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { toCard } from "@/lib/card-place"
import { getPlaces } from "@/lib/places"
import { lateCandidates } from "@/lib/tonight"

type Props = PageProps<"/[locale]/tonight">

export const revalidate = 86400

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("tonight")
  return { title: t("title"), description: t("tagline"), alternates: { canonical: "/tonight" } }
}

export default async function TonightPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("tonight")
  const places = lateCandidates(await getPlaces({}, { sort: "trending" })).map(toCard)

  return (
    <div>
      <SectionHeader line="purple" bullet="🌙" title={t("title")} tagline={t("tagline")} />
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 lg:px-8">
        <TonightView places={places} />
        <p className="max-w-prose text-sm text-muted-foreground">
          {t("note")}{" "}
          <Link href="/photo-spots" className="font-semibold underline underline-offset-4">
            {t("photoSpots")}
          </Link>
        </p>
      </div>
    </div>
  )
}
