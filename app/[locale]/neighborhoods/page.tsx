import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { SectionHeader } from "@/components/listing/section-header"
import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { LINES } from "@/lib/lines"
import { getPlaces } from "@/lib/places"
import { BOROUGH_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { BOROUGHS } from "@/types/enums"

type Props = PageProps<"/[locale]/neighborhoods">

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("neighborhoods")
  return {
    title: t("title"),
    description: t("tagline"),
    alternates: { canonical: "/neighborhoods" },
  }
}

export default async function NeighborhoodsPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations()
  const places = await getPlaces()
  const count = (name: string) => places.filter((p) => p.neighborhood === name).length

  return (
    <div>
      <SectionHeader
        line="green"
        bullet="N"
        title={t("neighborhoods.title")}
        tagline={t("neighborhoods.tagline")}
      />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 lg:px-8">
        {BOROUGHS.map((borough) => {
          const meta = BOROUGH_META[borough]
          const hoods = NEIGHBORHOODS.filter((n) => n.borough === borough).sort(
            (a, b) => count(b.name) - count(a.name) || a.name.localeCompare(b.name),
          )
          return (
            <section key={borough} aria-labelledby={`borough-${borough}`} className="space-y-4">
              <h2
                id={`borough-${borough}`}
                className="flex items-center gap-3 font-display text-display-md"
              >
                <LineBullet line={meta.line} size="md">
                  {meta.bullet}
                </LineBullet>
                {t(`borough.${borough}`)}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {hoods.map((n) => {
                  const c = count(n.name)
                  return (
                    <li key={n.slug}>
                      <Link
                        href={`/neighborhoods/${n.slug}`}
                        className={cn(
                          "flex h-full flex-col gap-1.5 rounded-xl border-l-8 bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
                          LINES[meta.line].border,
                        )}
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-lg font-bold">{n.name}</span>
                          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                            {t("neighborhoods.count", { count: c })}
                          </span>
                        </span>
                        <span className="text-sm leading-relaxed text-muted-foreground">
                          {t(`neighborhoods.blurbs.${n.slug}` as "neighborhoods.blurbs.chinatown")}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
