import {
  CreditCard,
  Plane,
  Leaf,
  ShieldCheck,
  Snowflake,
  Sun,
  TrainFront,
  Trees,
  Wallet,
} from "lucide-react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SignBand } from "@/components/brand/sign-band"
import { SectionHeader } from "@/components/listing/section-header"
import { TipCalculator } from "@/components/tips/tip-calculator"
import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { getPlaces } from "@/lib/places"
import { BOROUGHS } from "@/types/enums"

type Props = PageProps<"/[locale]/tips">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("tips")
  return { title: t("title"), description: t("tagline") }
}

const SEASONS = [
  { key: "spring", icon: Leaf },
  { key: "summer", icon: Sun },
  { key: "fall", icon: Trees },
  { key: "winter", icon: Snowflake },
] as const

export default async function TipsPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("tips")
  const tBorough = await getTranslations("borough")
  const places = await getPlaces()
  const countIn = (name: string) => places.filter((p) => p.neighborhood === name).length

  const lists = [
    { id: "airports", icon: Plane, items: t.raw("airports.items") as string[] },
    { id: "subway", icon: TrainFront, items: t.raw("subway.items") as string[] },
    { id: "tipping", icon: Wallet, items: t.raw("tipping.items") as string[] },
    { id: "safety", icon: ShieldCheck, items: t.raw("safety.items") as string[] },
  ] as const

  return (
    <div>
      <SectionHeader line="blue" bullet="i" title={t("title")} tagline={t("tagline")} />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 lg:grid-cols-[14rem_1fr] lg:px-8">
        <nav aria-label={t("contents")} className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-sm font-bold text-muted-foreground">{t("contents")}</p>
          <ol className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {(["airports", "subway", "tipping", "safety", "neighborhoods", "seasons"] as const).map(
              (id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-block rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-accent lg:rounded-lg"
                  >
                    {t(`${id}.title`)}
                  </a>
                </li>
              ),
            )}
          </ol>
        </nav>

        <div className="min-w-0 space-y-14">
          {lists.map(({ id, icon: Icon, items }) => (
            <section key={id} aria-labelledby={id} className="scroll-mt-24 space-y-5">
              <SignBand id={id} title={t(`${id}.title`)} />
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <Icon aria-hidden className="mt-1 size-4 shrink-0 text-muted-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {id === "airports" ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Plane aria-hidden className="size-4" />
                  <a
                    href="https://www.panynj.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    {t("airports.source")}
                  </a>
                </p>
              ) : null}
              {id === "tipping" ? <TipCalculator /> : null}
              {id === "subway" ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard aria-hidden className="size-4" />
                  <a
                    href="https://new.mta.info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    {t("subway.source")}
                  </a>
                </p>
              ) : null}
            </section>
          ))}

          <section aria-labelledby="neighborhoods" className="scroll-mt-24 space-y-5">
            <SignBand id="neighborhoods" title={t("neighborhoods.title")} />
            <p className="text-muted-foreground">{t("neighborhoods.intro")}</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {BOROUGHS.map((b) => (
                <div key={b} className="space-y-2">
                  <h3 className="font-display text-2xl">{tBorough(b)}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {NEIGHBORHOODS.filter((n) => n.borough === b).map((n) => {
                      const count = countIn(n.name)
                      return (
                        <li key={n.slug}>
                          <Link
                            href={`/neighborhoods/${n.slug}`}
                            className="inline-flex items-center gap-2 rounded-full border-2 border-transparent bg-card px-3 py-1.5 text-sm font-semibold hover:border-foreground"
                          >
                            {n.name}
                            <span className="text-xs text-muted-foreground">
                              {t("neighborhoods.count", { count })}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="seasons" className="scroll-mt-24 space-y-5">
            <SignBand id="seasons" title={t("seasons.title")} />
            <ul className="grid gap-3 sm:grid-cols-2">
              {SEASONS.map(({ key, icon: Icon }) => (
                <li key={key} className="space-y-2 rounded-2xl border bg-card p-5">
                  <h3 className="flex items-center gap-2 font-bold">
                    <Icon aria-hidden className="size-5" />
                    {t(`seasons.${key}.title`)}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t(`seasons.${key}.body`)}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">{t("seasons.note")}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
