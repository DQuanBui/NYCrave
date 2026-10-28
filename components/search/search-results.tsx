"use client"

import { LocateFixed } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { pillClass } from "@/components/listing/filter-menu"
import { OpenAtMenu } from "@/components/listing/open-at-menu"
import { PagedGrid } from "@/components/listing/paged-grid"
import { inKind, KindTabs, type KindTab } from "@/components/place/kind-tabs"
import { OpenNowToggle, keepOpen, keepOpenAt } from "@/components/place/open-now-toggle"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useNow } from "@/hooks/use-now"
import type { CardPlace } from "@/lib/card-place"
import { estimateTravel } from "@/lib/planner/estimates"
import type { Travel } from "@/lib/planner/types"

/**
 * Search results with tabs by kind of place, switches for what is open now
 * or at a chosen time, and "Near me" to sort by distance (the position stays on the device).
 */
export function SearchResults({ places }: { places: CardPlace[] }) {
  const t = useTranslations("search")
  const tFilters = useTranslations("filters")
  const [tab, setTab] = useState<KindTab>("all")
  const [openOnly, setOpenOnly] = useState(false)
  /** "Open at" a chosen weekday and time instead of now, as "sat-2100". */
  const [at, setAt] = useState<string | undefined>()
  const geo = useGeolocation()
  const origin = geo.state.status === "ready" ? geo.state.position : null
  const now = useNow()
  const open = keepOpenAt(keepOpen(inKind(places, tab), openOnly, now), at)
  const travel: Record<string, Travel> | undefined = origin
    ? Object.fromEntries(open.map((p) => [p.id, estimateTravel(origin, p)]))
    : undefined
  const shown = travel ? [...open].sort((a, b) => travel[a.id].km - travel[b.id].km) : open

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <OpenNowToggle
          pressed={openOnly}
          onToggle={() => {
            setOpenOnly((v) => !v)
            setAt(undefined)
          }}
          label={t("openNowToggle")}
        />
        <OpenAtMenu
          value={at}
          onChange={(v) => {
            setAt(v)
            setOpenOnly(false)
          }}
        />
        <button
          type="button"
          aria-pressed={Boolean(origin)}
          onClick={origin ? geo.reset : geo.locate}
          disabled={geo.state.status === "locating"}
          className={pillClass(Boolean(origin))}
        >
          <LocateFixed aria-hidden className="size-4" />
          {geo.state.status === "locating" ? tFilters("locating") : tFilters("nearMe")}
        </button>
        <KindTabs places={places} value={tab} onChange={setTab} label={t("byKind")} />
      </div>
      {geo.state.status === "denied" ? (
        <p role="status" className="text-sm text-muted-foreground">
          {tFilters("locationDenied")}
        </p>
      ) : null}
      {shown.length === 0 ? (
        <p aria-live="polite" className="rounded-2xl border bg-card p-6 text-muted-foreground">
          {at ? tFilters("noneOpenAt") : t("noneOpen")}
        </p>
      ) : (
        <PagedGrid
          key={`${tab}-${openOnly}-${at}-${Boolean(origin)}`}
          places={shown}
          travel={travel}
        />
      )}
    </div>
  )
}
