"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { inKind, KindTabs, type KindTab } from "@/components/place/kind-tabs"
import { OpenNowToggle, keepOpen } from "@/components/place/open-now-toggle"
import { PlaceGrid } from "@/components/place/place-grid"
import { useNow } from "@/hooks/use-now"
import type { CardPlace } from "@/lib/card-place"

/** Search results with tabs by kind of place and a switch for what is open now. */
export function SearchResults({ places }: { places: CardPlace[] }) {
  const t = useTranslations("search")
  const [tab, setTab] = useState<KindTab>("all")
  const [openOnly, setOpenOnly] = useState(false)
  const now = useNow()
  const shown = keepOpen(inKind(places, tab), openOnly, now)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <OpenNowToggle
          pressed={openOnly}
          onToggle={() => setOpenOnly((v) => !v)}
          label={t("openNowToggle")}
        />
        <KindTabs places={places} value={tab} onChange={setTab} label={t("byKind")} />
      </div>
      {shown.length === 0 ? (
        <p aria-live="polite" className="rounded-2xl border bg-card p-6 text-muted-foreground">
          {t("noneOpen")}
        </p>
      ) : (
        <PlaceGrid places={shown} />
      )}
    </div>
  )
}
