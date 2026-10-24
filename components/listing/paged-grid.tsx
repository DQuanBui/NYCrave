"use client"

import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { PlaceGrid } from "@/components/place/place-grid"
import type { CardPlace } from "@/lib/card-place"
import type { Travel } from "@/lib/planner/types"

/** How many cards a listing shows at first, and adds per "Show more". */
export const PAGE_SIZE = 24

/**
 * A place grid that shows the first page and adds more on request, so long
 * listings stay light. Focus moves to the first new card after each step.
 */
export function PagedGrid({
  places,
  travel,
}: {
  places: CardPlace[]
  travel?: Record<string, Travel>
}) {
  const t = useTranslations("filters")
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [focusFrom, setFocusFrom] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const rest = places.length - limit

  useEffect(() => {
    if (focusFrom === null) return
    root.current
      ?.querySelector<HTMLElement>(`:scope > ul > li:nth-child(${focusFrom + 1}) a[href]`)
      ?.focus()
  }, [focusFrom])

  return (
    <div ref={root} className="space-y-8">
      <PlaceGrid places={places.slice(0, limit)} travel={travel} />
      {rest > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFocusFrom(limit)
              setLimit((n) => n + PAGE_SIZE)
            }}
            className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-foreground px-6 font-bold transition-colors hover:bg-foreground hover:text-background"
          >
            {t("showMore", { count: Math.min(PAGE_SIZE, rest) })}
            <ChevronDown aria-hidden className="size-4" />
          </button>
          <p className="text-sm text-muted-foreground">
            {t("showing", { shown: limit, total: places.length })}
          </p>
        </div>
      ) : null}
    </div>
  )
}
