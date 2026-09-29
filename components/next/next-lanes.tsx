"use client"

import { Footprints, Navigation } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { PlacePhoto } from "@/components/place/place-photo"
import { SaveButton } from "@/components/place/save-button"
import { Link } from "@/i18n/navigation"
import { formatClockTime } from "@/lib/hours"
import { LINES } from "@/lib/lines"
import { cn } from "@/lib/utils"
import type { NextLane } from "@/lib/whats-next"

function walkingUrl(to: { lat: number; lng: number }) {
  const url = new URL("https://www.google.com/maps/dir/")
  url.searchParams.set("api", "1")
  url.searchParams.set("destination", `${to.lat},${to.lng}`)
  url.searchParams.set("travelmode", "walking")
  return url.toString()
}

/** Suggestion lanes ("Something sweet", "A drink"...), each with a few walkable picks. */
export function NextLanes({
  lanes,
  headingLevel = "h3",
}: {
  lanes: NextLane[]
  headingLevel?: "h2" | "h3"
}) {
  const t = useTranslations("next")
  const locale = useLocale()
  const Heading = headingLevel

  return (
    <div className="space-y-8">
      {lanes.map((lane) => (
        <section key={lane.key} aria-label={t(`lanes.${lane.key}`)} className="space-y-3">
          <Heading className="flex items-center gap-3 font-display text-2xl">
            <span
              aria-hidden
              className={cn(
                "grid size-10 place-items-center rounded-full text-xl",
                LINES[lane.line].bg,
              )}
            >
              {lane.emoji}
            </span>
            {t(`lanes.${lane.key}`)}
          </Heading>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lane.picks.map(({ place, walkMinutes, closesAt }) => (
              <li
                key={place.slug}
                className="group relative flex gap-3 rounded-2xl border bg-card p-3 transition-shadow hover:shadow-[0_10px_30px_-14px_rgba(29,31,33,0.4)]"
              >
                <PlacePhoto
                  place={place}
                  sizes="96px"
                  showChip={false}
                  className="size-24 shrink-0 rounded-xl"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Link
                    href={`/place/${place.slug}`}
                    className="line-clamp-2 leading-snug font-bold after:absolute after:inset-0 after:rounded-2xl"
                  >
                    {place.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{place.neighborhood}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                      <Footprints aria-hidden className="size-3.5" />
                      {t("walk", { minutes: walkMinutes })}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-line-green/15 px-2 py-0.5 text-foreground">
                      <span aria-hidden className="size-1.5 rounded-full bg-line-green" />
                      {closesAt
                        ? t("openUntil", { time: formatClockTime(closesAt.minutes, locale) })
                        : t("openAllNight")}
                    </span>
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-1.5">
                  <SaveButton
                    slug={place.slug}
                    name={place.name}
                    variant="outline"
                    className="size-9"
                  />
                  <a
                    href={walkingUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("directions", { name: place.name })}
                    className="grid size-9 place-items-center rounded-full border-2 border-foreground transition-colors hover:bg-accent"
                  >
                    <Navigation aria-hidden className="size-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
