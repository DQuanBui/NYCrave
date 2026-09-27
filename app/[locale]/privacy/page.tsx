import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SectionHeader } from "@/components/listing/section-header"
import { initLocale } from "@/i18n/locale"

type Props = PageProps<"/[locale]/privacy">

const SECTIONS = ["device", "location", "reports", "services", "assistant", "none"] as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("privacy")
  return { title: t("title"), description: t("tagline"), alternates: { canonical: "/privacy" } }
}

/** Plain-language privacy notes that match what the code does. */
export default async function PrivacyPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("privacy")
  return (
    <div>
      <SectionHeader line="gray" bullet="i" title={t("title")} tagline={t("tagline")} />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 lg:px-8">
        {SECTIONS.map((key) => (
          <section key={key} aria-labelledby={`privacy-${key}`} className="space-y-3">
            <h2 id={`privacy-${key}`} className="font-display text-display-sm">
              {t(`${key}.title`)}
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed">
              {(t.raw(`${key}.items`) as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-sm text-muted-foreground">{t("updated")}</p>
      </div>
    </div>
  )
}
