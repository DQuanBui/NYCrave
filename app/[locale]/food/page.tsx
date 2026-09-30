import { Lightbulb, MapPin } from "lucide-react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SignBand } from "@/components/brand/sign-band"
import { MenuBoard } from "@/components/food/menu-board"
import { PlacePhoto } from "@/components/place/place-photo"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { toCard } from "@/lib/card-place"
import { dishCover, DISHES, LOCAL_TIPS, placesServing } from "@/lib/food-guide"
import { LINES } from "@/lib/lines"
import { getPlaces } from "@/lib/places"
import { cn } from "@/lib/utils"

type Props = PageProps<"/[locale]/food">

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("food")
  return { title: t("title"), description: t("tagline"), alternates: { canonical: "/food" } }
}

const TIP_EMOJI: Record<(typeof LOCAL_TIPS)[number], string> = {
  fold: "🍕",
  counter: "🎟️",
  bodega: "🥚",
  walkIns: "🪑",
  cash: "💵",
  late: "🌙",
}

export default async function FoodGuidePage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("food")
  const places = await getPlaces({}, { sort: "trending" })
  const menu = DISHES.map((dish) => ({ dish, where: placesServing(dish, places) })).filter(
    (d) => d.where.length > 0,
  )

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 lg:px-8 lg:py-12">
      <header className="space-y-5">
        <h1 className="sr-only">{t("title")}</h1>
        <MenuBoard text={t("board")} />
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("tagline")}</p>
        <nav aria-label={t("jump")}>
          <ul className="-mx-4 scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {menu.map(({ dish }) => (
              <li key={dish.key} className="shrink-0">
                <a
                  href={`#${dish.key}`}
                  className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-foreground/15 bg-card px-4 text-sm font-semibold transition-colors hover:border-foreground"
                >
                  <span aria-hidden>{dish.emoji}</span>
                  {t(`dishes.${dish.key}.name`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {menu.map(({ dish, where }) => {
          const line = LINES[dish.line]
          const cover = dishCover(dish, places) ?? toCard(where[0])
          return (
            <article
              key={dish.key}
              id={dish.key}
              aria-labelledby={`${dish.key}-name`}
              className="group scroll-mt-24 overflow-hidden rounded-3xl border bg-card"
            >
              <div className="relative aspect-[16/9]">
                <PlacePhoto
                  place={cover}
                  sizes="(min-width: 1024px) 40rem, 100vw"
                  className="absolute inset-0 transition-transform duration-700 ease-(--ease-out-quint) group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute -bottom-7 left-5 grid size-16 place-items-center rounded-full text-3xl shadow-lg ring-4 ring-card transition-transform duration-500 group-hover:-rotate-12",
                    line.bg,
                  )}
                >
                  {dish.emoji}
                </span>
              </div>
              <div className="space-y-4 p-5 pt-10 sm:p-6 sm:pt-11">
                <h2 id={`${dish.key}-name`} className="font-display text-display-md">
                  {t(`dishes.${dish.key}.name`)}
                </h2>
                <p className="max-w-prose leading-relaxed">{t(`dishes.${dish.key}.body`)}</p>
                <p
                  className={cn("rounded-xl border-l-4 bg-muted/60 px-4 py-3 text-sm", line.border)}
                >
                  <span className="mr-1.5 inline-flex items-center gap-1 font-bold">
                    <Lightbulb aria-hidden className="size-4" />
                    {t("localTip")}:
                  </span>
                  {t(`dishes.${dish.key}.tip`)}
                </p>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-muted-foreground">{t("whereToTry")}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {where.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/place/${p.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full border-2 border-transparent bg-muted px-3 py-1.5 text-sm font-semibold transition-colors hover:border-foreground"
                        >
                          <MapPin aria-hidden className="size-3.5" />
                          {p.name}
                          <span className="font-normal text-muted-foreground">
                            {p.neighborhood}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <section aria-labelledby="local-tips" className="space-y-6">
        <SignBand id="local-tips" title={t("tipsTitle")} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOCAL_TIPS.map((key) => (
            <li key={key} className="flex gap-4 rounded-2xl border bg-card p-5">
              <span aria-hidden className="text-3xl">
                {TIP_EMOJI[key]}
              </span>
              <div className="space-y-1.5">
                <h3 className="font-bold">{t(`tips.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`tips.${key}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/tips#tipping" className="inline-block font-bold underline underline-offset-4">
          {t("tippingLink")}
        </Link>
      </section>
    </div>
  )
}
