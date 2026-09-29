import { CalendarDays, MapPin, Sunset } from "lucide-react"
import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { SignBand } from "@/components/brand/sign-band"
import { SectionHeader } from "@/components/listing/section-header"
import { HengeArt } from "@/components/seasons/henge-art"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { formatClockTime, nycDateString } from "@/lib/hours"
import { getPlaces } from "@/lib/places"
import { formatWindow, sunsetMinutes, upcomingSeasons } from "@/lib/seasons"
import { LINES } from "@/lib/lines"
import { cn } from "@/lib/utils"

type Props = PageProps<"/[locale]/seasons">

// The countdowns move every day
export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("seasons")
  return { title: t("title"), description: t("tagline"), alternates: { canonical: "/seasons" } }
}

export default async function SeasonsPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("seasons")
  const locale = await getLocale()
  const today = nycDateString(new Date())
  const seasons = upcomingSeasons(today)
  const places = new Map((await getPlaces()).map((p) => [p.slug, p]))

  const henge = seasons
    .filter((s) => s.event.key.startsWith("manhattanhenge"))
    .sort((a, b) => a.daysUntil - b.daysUntil)
  const nextHenge = henge[0]
  const countdown = (days: number, happening: boolean) =>
    happening ? t("status.now") : t("status.countdown", { days })

  return (
    <div>
      <SectionHeader line="orange" bullet="S" title={t("title")} tagline={t("tagline")} />

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 lg:px-8 lg:py-14">
        <section
          aria-labelledby="manhattanhenge"
          className="grid overflow-hidden rounded-3xl bg-sign text-sign-foreground lg:grid-cols-[1.15fr_1fr]"
        >
          <HengeArt className="aspect-[16/10] w-full lg:aspect-auto lg:h-full" />
          <div className="space-y-6 p-6 sm:p-8 lg:p-10">
            <div className="space-y-3">
              <h2 id="manhattanhenge" className="font-display text-display-md sm:text-display-lg">
                {t("henge.title")}
              </h2>
              <p className="max-w-prose leading-relaxed text-sign-foreground/80">
                {t("henge.body")}
              </p>
            </div>

            <p className="font-display text-5xl text-[#ffc15e] tabular-nums sm:text-6xl">
              {countdown(nextHenge.daysUntil, nextHenge.happening)}
            </p>

            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-sign-foreground/70">
                <CalendarDays aria-hidden className="size-4" />
                {t("henge.next")}
              </h3>
              <ul className="space-y-2">
                {henge.map((s) => (
                  <li
                    key={s.event.key}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-xl bg-white/5 px-4 py-3"
                  >
                    <span className="font-semibold">{formatWindow(s.window, locale)}</span>
                    <span className="flex items-center gap-1.5 text-sm text-sign-foreground/75">
                      <Sunset aria-hidden className="size-4 text-[#ffc15e]" />
                      {t("henge.sunset", {
                        time: formatClockTime(sunsetMinutes(s.window.start), locale),
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-sign-foreground/70">
                <MapPin aria-hidden className="size-4" />
                {t("henge.where")}
              </h3>
              <p className="leading-relaxed">
                {t("henge.whereBody")}{" "}
                <Link
                  href="/place/tudor-city-bridge"
                  className="font-semibold underline underline-offset-4"
                >
                  {t("henge.tudorCity")}
                </Link>
              </p>
            </div>
            <p className="text-sm text-sign-foreground/65">{t("henge.note")}</p>
          </div>
        </section>

        <section aria-labelledby="year" className="space-y-6">
          <SignBand id="year" title={t("year")} />
          <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[1.4rem] before:w-1 before:rounded-full before:bg-border sm:before:left-[1.65rem]">
            {seasons.map(({ event, window, daysUntil, happening }) => {
              const line = LINES[event.line]
              const linked = event.places.flatMap((slug) => places.get(slug) ?? [])
              return (
                <li
                  key={event.key}
                  id={event.key}
                  className="relative flex scroll-mt-24 gap-4 sm:gap-6"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 grid size-12 shrink-0 place-items-center rounded-full text-2xl ring-4 ring-background sm:size-14 sm:text-3xl",
                      line.bg,
                    )}
                  >
                    {event.emoji}
                  </span>
                  <div
                    className={cn(
                      "min-w-0 flex-1 space-y-3 rounded-2xl border bg-card p-5",
                      happening && "border-2 border-foreground",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h3 className="font-display text-2xl">{t(`events.${event.key}.name`)}</h3>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-sm font-bold",
                          happening ? "bg-taxi text-taxi-foreground" : "bg-muted",
                        )}
                      >
                        {countdown(daysUntil, happening)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {formatWindow(window, locale)}
                      {event.approximate ? ` (${t("approximate")})` : null}
                    </p>
                    <p className="max-w-prose leading-relaxed">{t(`events.${event.key}.body`)}</p>
                    {linked.length ? (
                      <ul className="flex flex-wrap gap-2" aria-label={t("wherePlaces")}>
                        {linked.map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/place/${p.slug}`}
                              className="inline-flex items-center gap-1.5 rounded-full border-2 border-transparent bg-muted px-3 py-1 text-sm font-semibold hover:border-foreground"
                            >
                              <MapPin aria-hidden className="size-3.5" />
                              {p.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </div>
  )
}
