import { Clock, Footprints } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { getLocale, getTranslations } from "next-intl/server"
import { SignBand } from "@/components/brand/sign-band"
import { SkyRibbon } from "@/components/light/sky-ribbon"
import { SectionHeader } from "@/components/listing/section-header"
import { SunToday } from "@/components/place/sun-today"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { formatClockTime, nycClock, nycDateString } from "@/lib/hours"
import { LINES } from "@/lib/lines"
import { lightBands, PHASE_COLOR, PHOTO_WALKS, timeWalk } from "@/lib/photo-walks"
import { getPlaces } from "@/lib/places"
import { sunDay } from "@/lib/sun"
import { cn } from "@/lib/utils"

type Props = PageProps<"/[locale]/golden-hour">

// The sun moves a minute or two a day
export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("goldenHour")
  return {
    title: t("title"),
    description: t("tagline"),
    alternates: { canonical: "/golden-hour" },
  }
}

export default async function GoldenHourPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("goldenHour")
  const locale = await getLocale()
  const now = new Date()
  const sun = sunDay(nycDateString(now))
  const { weekday } = nycClock(now)
  const spots = await getPlaces({ category: "photo_spot" })
  const bySlug = new Map(spots.map((p) => [p.slug, p]))
  const walks = PHOTO_WALKS.flatMap((w) => timeWalk(w, sun, weekday, bySlug) ?? [])
  const time = (m: number) => formatClockTime(m, locale)
  const prints = ["brooklyn-heights-promenade", "tudor-city-bridge", "pebble-beach-dumbo"].flatMap(
    (slug) => bySlug.get(slug)?.photos.slice(0, 1) ?? [],
  )

  return (
    <div>
      <SectionHeader
        line="yellow"
        bullet="☀"
        title={t("title")}
        tagline={t("tagline")}
        photos={prints}
      />

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-10 lg:px-8 lg:py-14">
        <section aria-labelledby="sky" className="space-y-5 rounded-3xl border bg-card p-5 sm:p-8">
          <div className="space-y-1">
            <h2 id="sky" className="font-display text-display-md">
              {t("skyTitle")}
            </h2>
            <p className="max-w-prose text-muted-foreground">{t("skyBody")}</p>
          </div>
          <SkyRibbon bands={lightBands(sun)} sunrise={sun.sunrise} sunset={sun.sunset} />
        </section>

        <SunToday />

        <section aria-labelledby="walks" className="space-y-6">
          <SignBand id="walks" title={t("walksTitle")} />
          <p className="max-w-prose leading-relaxed text-muted-foreground">{t("walksIntro")}</p>
          <ol className="grid gap-6 lg:grid-cols-2">
            {walks.map(({ walk, start, stops, walkMinutes, km }) => {
              const line = LINES[walk.line]
              const cover = stops.flatMap((s) => s.spot.photos.slice(0, 1))[0]
              return (
                <li
                  key={walk.key}
                  id={walk.key}
                  className="flex scroll-mt-24 flex-col overflow-hidden rounded-3xl border bg-card"
                >
                  <div className="relative aspect-[16/7] bg-muted">
                    {cover ? (
                      <Image
                        src={cover.url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                      <h3 className="font-display text-2xl leading-tight sm:text-3xl">
                        <span aria-hidden className="mr-2">
                          {walk.emoji}
                        </span>
                        {t(`walks.${walk.key}.title`)}
                      </h3>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-bold text-black tabular-nums">
                        <span aria-hidden className={cn("size-2.5 rounded-full", line.bg)} />
                        {t("start", { time: time(start) })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-5 p-5">
                    <p className="leading-relaxed">{t(`walks.${walk.key}.body`)}</p>
                    <ol className="relative space-y-1">
                      {stops.map((stop, i) => (
                        <li key={stop.spot.slug}>
                          {stop.walk ? (
                            <p className="flex items-center gap-2 py-1 pl-[1.15rem] text-xs text-muted-foreground">
                              <Footprints aria-hidden className="size-3.5" />
                              {t("walkLeg", { minutes: stop.walk })}
                            </p>
                          ) : null}
                          <div className="flex items-start gap-3">
                            <span
                              aria-hidden
                              className={cn(
                                "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold",
                                line.bg,
                                line.fg,
                              )}
                            >
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/place/${stop.spot.slug}`}
                                className="font-semibold underline-offset-4 hover:underline"
                              >
                                {stop.spot.name}
                              </Link>
                              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground tabular-nums">
                                  {time(stop.arrive)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <span
                                    aria-hidden
                                    className="size-2.5 rounded-full ring-1 ring-foreground/25"
                                    style={{ background: PHASE_COLOR[stop.phase] }}
                                  />
                                  {t(`phase.${stop.phase}`)}
                                </span>
                                {stop.waitedToOpen ? <span>{t("opensAt")}</span> : null}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Footprints aria-hidden className="size-4" />
                        {t("distance", { km, minutes: walkMinutes })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock aria-hidden className="size-4" />
                        {t("finish", { time: time(stops.at(-1)!.arrive) })}
                      </span>
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
          <p className="max-w-prose text-sm text-muted-foreground">{t("note")}</p>
        </section>
      </div>
    </div>
  )
}
