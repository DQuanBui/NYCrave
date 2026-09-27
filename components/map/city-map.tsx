"use client"

import { ArrowRight, LocateFixed, Navigation, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { LineBullet } from "@/components/brand/line-bullet"
import { pillClass } from "@/components/listing/filter-menu"
import { LazyMap } from "@/components/map/lazy-map"
import { HoursBadge } from "@/components/place/hours-badge"
import { PlacePhoto } from "@/components/place/place-photo"
import { SaveButton } from "@/components/place/save-button"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useNow } from "@/hooks/use-now"
import { Link } from "@/i18n/navigation"
import type { CardPlace } from "@/lib/card-place"
import { getOpenStatus, isOpen } from "@/lib/hours"
import { placeToPoint } from "@/lib/map-points"
import { estimateTravel } from "@/lib/planner/estimates"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/types/enums"
import type { Category } from "@/types/place"

/** Every place on one map, with line toggles and a preview card. */
export function CityMap({ places }: { places: CardPlace[] }) {
  const t = useTranslations()
  const now = useNow()
  const geo = useGeolocation()
  const [lines, setLines] = useState<Set<Category>>(() => new Set(CATEGORIES))
  const [openNow, setOpenNow] = useState(false)
  const [freeOnly, setFreeOnly] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const visible = useMemo(
    () =>
      places.filter(
        (p) =>
          lines.has(p.category) &&
          (!freeOnly || p.isFree) &&
          (!openNow || !now || isOpen(getOpenStatus(p.hours, now))),
      ),
    [places, lines, freeOnly, openNow, now],
  )
  const points = useMemo(() => visible.map((p) => placeToPoint(p)), [visible])
  const selected = visible.find((p) => p.id === selectedId)
  const origin = geo.state.status === "ready" ? geo.state.position : null
  const travel = selected && origin ? estimateTravel(origin, selected) : null

  const toggleLine = (c: Category) =>
    setLines((prev) => {
      // Tapping the only active line brings every line back
      if (prev.size === 1 && prev.has(c)) return new Set(CATEGORIES)
      // From "all", a tap isolates that line; after that, taps add or remove
      if (prev.size === CATEGORIES.length) return new Set([c])
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 z-10 p-3 sm:p-4">
        <div className="relative scrollbar-none flex gap-1.5 overflow-x-auto rounded-2xl bg-background/90 p-2 shadow-lg backdrop-blur">
          {CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c]
            const on = lines.has(c) && lines.size < CATEGORIES.length
            return (
              <button
                key={c}
                type="button"
                aria-pressed={lines.has(c)}
                onClick={() => toggleLine(c)}
                className={cn(pillClass(on), "shrink-0 pl-1.5", !lines.has(c) && "opacity-50")}
              >
                <LineBullet line={meta.line} size="xs">
                  {meta.bullet}
                </LineBullet>
                {t(`categories.${c}.nav`)}
              </button>
            )
          })}
          <span aria-hidden className="mx-1 w-px shrink-0 bg-border" />
          <button
            type="button"
            aria-pressed={openNow}
            onClick={() => setOpenNow((v) => !v)}
            className={cn(pillClass(openNow), "shrink-0")}
          >
            {t("cityMap.openNow")}
          </button>
          <button
            type="button"
            aria-pressed={freeOnly}
            onClick={() => setFreeOnly((v) => !v)}
            className={cn(pillClass(freeOnly), "shrink-0")}
          >
            {t("filters.free")}
          </button>
          <button
            type="button"
            aria-pressed={Boolean(origin)}
            onClick={origin ? geo.reset : geo.locate}
            disabled={geo.state.status === "locating"}
            className={cn(pillClass(Boolean(origin)), "shrink-0")}
          >
            <LocateFixed aria-hidden className="size-4" />
            {geo.state.status === "locating" ? t("filters.locating") : t("filters.nearMe")}
          </button>
        </div>
        <p
          aria-live="polite"
          className="mt-2 ml-1 inline-block rounded-full bg-background/90 px-3 py-1 text-sm font-semibold shadow"
        >
          {t("cityMap.count", { count: visible.length })}
        </p>
      </div>

      <LazyMap
        points={points}
        ariaLabel={t("cityMap.label")}
        selectedId={selectedId}
        onSelect={setSelectedId}
        cooperative={false}
        padding={{ top: 150, bottom: selected ? 190 : 50, left: 40, right: 40 }}
        controlsPosition="bottom-right"
        initialView={{ longitude: -73.975, latitude: 40.728, zoom: 11.6 }}
        userLocation={origin}
        className="h-[calc(100dvh-8rem)] min-h-[28rem] rounded-none border-0 md:h-[calc(100dvh-4rem)]"
      />

      {selected ? (
        <div className="absolute inset-x-3 bottom-3 z-10 mx-auto max-w-md sm:bottom-6">
          <article
            aria-label={selected.name}
            className="relative flex gap-3 rounded-2xl border bg-card p-3 pr-12 shadow-2xl"
          >
            <PlacePhoto
              place={selected}
              sizes="112px"
              showChip={false}
              className="size-24 shrink-0 rounded-xl sm:size-28"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <LineBullet line={CATEGORY_META[selected.category].line} size="xs">
                  {CATEGORY_META[selected.category].bullet}
                </LineBullet>
                {t(`categories.${selected.category}.label`)}
              </p>
              <h2 className="leading-tight font-bold text-balance">{selected.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selected.neighborhood}, {t(`borough.${selected.borough}`)}
              </p>
              {travel ? (
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <Navigation aria-hidden className="size-3.5 text-line-blue" />
                  {t(travel.mode === "walk" ? "place.distanceWalk" : "place.distanceSubway", {
                    distance: (travel.km / 1.609).toFixed(1),
                    minutes: travel.minutes,
                  })}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                <HoursBadge hours={selected.hours} />
                <Link
                  href={`/place/${selected.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-bold underline-offset-4 hover:underline"
                >
                  {t("cityMap.open")}
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </div>
            <div className="absolute top-2 right-2 flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label={t("cityMap.close")}
                className="grid size-9 place-items-center rounded-full hover:bg-muted"
              >
                <X aria-hidden className="size-4" />
              </button>
              <SaveButton
                slug={selected.slug}
                name={selected.name}
                variant="outline"
                className="size-9 border"
              />
            </div>
          </article>
        </div>
      ) : null}
    </div>
  )
}
