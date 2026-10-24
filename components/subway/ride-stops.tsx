"use client"

import { Accessibility, Footprints } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { LineBullet } from "@/components/brand/line-bullet"
import { HoursBadge } from "@/components/place/hours-badge"
import { OpenNowToggle, keepOpen } from "@/components/place/open-now-toggle"
import { PlacePhoto } from "@/components/place/place-photo"
import { useNow } from "@/hooks/use-now"
import { Link } from "@/i18n/navigation"
import type { CardPlace } from "@/lib/card-place"
import type { LineColor } from "@/lib/lines"
import { LINES } from "@/lib/lines"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"

export type RideStop = {
  station: { name: string; ada?: boolean }
  places: { place: CardPlace; walk: number }[]
}

type Row = { kind: "stop"; stop: RideStop; end: boolean } | { kind: "run"; names: string[] }

/** Runs of stations with nothing (open) nearby fold into one quiet row. */
function toRows(stops: RideStop[]): Row[] {
  const rows: Row[] = []
  stops.forEach((stop, i) => {
    const end = i === 0 || i === stops.length - 1
    if (stop.places.length || end) return rows.push({ kind: "stop", stop, end })
    const prev = rows.at(-1)
    if (prev?.kind === "run") prev.names.push(stop.station.name)
    else rows.push({ kind: "run", names: [stop.station.name] })
  })
  return rows
}

/** The line's stops in riding order, with an "Open now" switch for the places. */
export function RideStops({ stops, color }: { stops: RideStop[]; color: LineColor }) {
  const t = useTranslations()
  const r = useTranslations("ride")
  const now = useNow()
  const [openOnly, setOpenOnly] = useState(false)
  const line = LINES[color]
  const shown = stops.map((stop) => ({
    ...stop,
    places: openOnly
      ? stop.places.filter(({ place }) => keepOpen([place], true, now).length)
      : stop.places,
  }))
  const rows = toRows(shown)

  return (
    <div className="space-y-4">
      <OpenNowToggle
        pressed={openOnly}
        onToggle={() => setOpenOnly((v) => !v)}
        label={t("subway.openNow")}
      />
      <ol className="relative">
        <span
          aria-hidden
          className={cn(
            "draw-on-view-y absolute top-5 bottom-5 left-[1.05rem] w-2.5 rounded-full",
            line.bg,
          )}
        />
        {rows.map((row, i) =>
          row.kind === "run" ? (
            <li key={`run-${i}`} className="relative flex gap-4 py-3 pl-1">
              <span aria-hidden className="flex w-8 shrink-0 flex-col items-center gap-1.5 py-1">
                {row.names.slice(0, 3).map((n) => (
                  <span key={n} className="relative size-2 rounded-full bg-background" />
                ))}
              </span>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">
                  {r("moreStops", { count: row.names.length })}:
                </span>{" "}
                {row.names.join(" · ")}
              </p>
            </li>
          ) : (
            <li key={row.stop.station.name + i} className="relative flex gap-4 py-4">
              <span
                aria-hidden
                className={cn(
                  "pop-on-view relative z-10 mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border-4 bg-background",
                  row.stop.places.length ? "border-foreground" : "border-muted-foreground/60",
                )}
              />
              <div className="min-w-0 flex-1 space-y-3">
                <h2
                  className={cn(
                    "font-display leading-tight",
                    row.end ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
                  )}
                >
                  {row.stop.station.name}
                  {row.stop.station.ada ? (
                    <Accessibility
                      role="img"
                      aria-label={t("subway.accessible")}
                      className="ml-2 inline size-5 align-middle text-line-blue dark:text-sky-300"
                    />
                  ) : null}
                  {row.stop.places.length ? (
                    <span className="ml-2 align-middle font-sans text-sm font-semibold text-muted-foreground">
                      {t("ride.count", { count: row.stop.places.length })}
                    </span>
                  ) : null}
                </h2>
                {row.stop.places.length ? (
                  <ul className="-mr-4 scrollbar-none flex gap-3 overflow-x-auto pr-4 pb-1 sm:mr-0 sm:grid sm:grid-cols-2 sm:pr-0 lg:grid-cols-3">
                    {row.stop.places.map(({ place, walk }) => (
                      <li key={place.slug} className="w-56 shrink-0 sm:w-auto">
                        <Link
                          href={`/place/${place.slug}`}
                          className="group flex h-full items-center gap-3 rounded-2xl border bg-card p-2 pr-3 transition-colors hover:border-foreground"
                        >
                          <PlacePhoto
                            place={place}
                            sizes="64px"
                            showChip={false}
                            className="size-16 shrink-0 rounded-xl"
                          />
                          <span className="min-w-0">
                            <span className="line-clamp-2 leading-snug font-semibold">
                              {place.name}
                            </span>
                            <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <LineBullet line={CATEGORY_META[place.category].line} size="xs">
                                {CATEGORY_META[place.category].bullet}
                              </LineBullet>
                              <Footprints aria-hidden className="size-3.5" />
                              {r("walk", { minutes: walk })}
                            </span>
                            <HoursBadge hours={place.hours} className="mt-0.5 text-xs" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ),
        )}
      </ol>
    </div>
  )
}
