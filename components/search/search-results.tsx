"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { inKind, KindTabs, type KindTab } from "@/components/place/kind-tabs"
import { PlaceGrid } from "@/components/place/place-grid"
import type { CardPlace } from "@/lib/card-place"

/** Search results with tabs by kind of place when the results mix several. */
export function SearchResults({ places }: { places: CardPlace[] }) {
  const t = useTranslations("search")
  const [tab, setTab] = useState<KindTab>("all")

  return (
    <div className="space-y-6">
      <KindTabs places={places} value={tab} onChange={setTab} label={t("byKind")} />
      <PlaceGrid places={inKind(places, tab)} />
    </div>
  )
}
