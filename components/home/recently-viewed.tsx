"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { PlaceRail } from "@/components/place/place-rail"
import { useHydrated } from "@/hooks/use-now"
import { useRecent } from "@/hooks/use-recent"
import type { CardPlace } from "@/lib/card-place"
import { loadCards } from "@/lib/cards-client"

/** The places this device opened lately, for picking up where you left off. */
export function RecentlyViewed() {
  const t = useTranslations("home")
  const hydrated = useHydrated()
  const { slugs, clear } = useRecent()
  const [cards, setCards] = useState<CardPlace[] | null>(null)
  const wanted = hydrated && slugs.length > 0

  useEffect(() => {
    if (!wanted) return
    let live = true
    loadCards()
      .then((all) => live && setCards(all))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [wanted])

  if (!wanted || !cards) return null
  const places = slugs.flatMap((slug) => cards.find((c) => c.slug === slug) ?? [])
  if (places.length === 0) return null

  return (
    <div className="space-y-2">
      <PlaceRail title={t("recent")} places={places} limit={12} />
      <button
        type="button"
        onClick={clear}
        className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        {t("recentClear")}
      </button>
    </div>
  )
}
