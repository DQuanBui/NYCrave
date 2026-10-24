import { ArrowRight, Lightbulb } from "lucide-react"
import { WithMessages } from "@/components/providers/with-messages"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { GuideSections } from "@/components/guides/guide-sections"
import { SectionHeader } from "@/components/listing/section-header"
import { LazyMap } from "@/components/map/lazy-map"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { toCard } from "@/lib/card-place"
import { GUIDE_TIPS, GUIDES, guideBySlug, guideSections } from "@/lib/guides"
import { placeToPoint } from "@/lib/map-points"
import { getPlaces } from "@/lib/places"
import { CATEGORY_META } from "@/lib/taxonomy"

type Props = PageProps<"/[locale]/guides/[slug]">

export const revalidate = 86400

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const guide = guideBySlug((await params).slug)
  if (!guide) return {}
  const t = await getTranslations(`guides.list.${guide.key}`)
  return {
    title: t("title"),
    description: t("tagline"),
    alternates: { canonical: `/guides/${guide.slug}` },
  }
}

export default async function GuidePage({ params }: Props) {
  await initLocale(params)
  const guide = guideBySlug((await params).slug)
  if (!guide) notFound()

  const t = await getTranslations()
  const g = await getTranslations(`guides.list.${guide.key}`)
  const all = await getPlaces({}, { sort: "trending" })
  const sections = guideSections(guide, all)
  const places = sections.flatMap((s) => s.places)
  const prints = places
    .flatMap((p) => p.photos.slice(0, 1))
    .filter((p) => !p.illustrative)
    .slice(0, 3)

  return (
    <div>
      <SectionHeader
        line={guide.line}
        bullet={guide.emoji}
        title={g("title")}
        tagline={g("tagline")}
        back={{ href: "/guides", label: t("guides.title") }}
        photos={prints}
      />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <p className="max-w-prose text-lg leading-relaxed">{g("intro")}</p>
            {guide.related ? (
              <Link
                href={guide.related}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background"
              >
                {t(
                  `guides.related.${guide.key as "lateNight" | "cheapEats" | "outdoors" | "dateNight"}`,
                )}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            ) : null}
            <nav aria-label={t("guides.jump")}>
              <ul className="flex flex-wrap gap-2">
                {sections.map(({ category, places }) => (
                  <li key={category}>
                    <a
                      href={`#${category}`}
                      className="flex items-center gap-1.5 rounded-full border-2 border-transparent bg-muted py-1 pr-3 pl-1 text-sm font-semibold hover:border-foreground"
                    >
                      <LineBullet line={CATEGORY_META[category].line} size="xs">
                        {CATEGORY_META[category].bullet}
                      </LineBullet>
                      {places.length} {t(`categories.${category}.title`)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <aside
            aria-labelledby="tips"
            className="space-y-3 rounded-2xl border-l-4 bg-card p-5"
            style={{ borderLeftColor: `var(--color-line-${guide.line})` }}
          >
            <h2 id="tips" className="flex items-center gap-2 font-bold">
              <Lightbulb aria-hidden className="size-4" />
              {t("guides.tips")}
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed">
              {Array.from({ length: GUIDE_TIPS }, (_, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden>•</span>
                  {g(`tips.${i as 0 | 1 | 2}`)}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <WithMessages namespaces={["guides"]}>
          <GuideSections
            sections={sections.map((s) => ({ category: s.category, places: s.places.map(toCard) }))}
          />
        </WithMessages>

        <LazyMap
          points={places.map((p) => placeToPoint(toCard(p)))}
          ariaLabel={t("guides.mapLabel", { name: g("title") })}
          className="h-72 sm:h-96"
        />

        <section aria-labelledby="more-guides" className="space-y-4">
          <h2 id="more-guides" className="font-display text-display-sm sm:text-3xl">
            {t("guides.more")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {GUIDES.filter((o) => o.key !== guide.key).map((o) => (
              <li key={o.key}>
                <Link
                  href={`/guides/${o.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-transparent bg-card px-4 py-2 font-semibold hover:border-foreground"
                >
                  <span aria-hidden>{o.emoji}</span>
                  {t(`guides.list.${o.key}.title`)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
