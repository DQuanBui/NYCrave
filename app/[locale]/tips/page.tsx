import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { initLocale } from "@/i18n/locale"
import { ComingSoon } from "@/components/brand/coming-soon"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("comingSoon.tips")
  return { title: t("title"), description: t("body") }
}

export default async function Page({ params }: PageProps<"/[locale]/tips">) {
  await initLocale(params)
  return <ComingSoon section="tips" line="blue" bullet={"i"} href="/explore" />
}
