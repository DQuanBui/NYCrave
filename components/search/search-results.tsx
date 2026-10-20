"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { LineBullet } from "@/components/brand/line-bullet"
import { PlaceGrid } from "@/components/place/place-grid"
import type { CardPlace } from "@/lib/card-place"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/types/enums"
import type { Category } from "@/types/place"

/** Search results with tabs by kind of place when the results mix several. */
export function SearchResults({ places }: { places: CardPlace[] }) {
  const t = useTranslations()
  const [tab, setTab] = useState<Category | "all">("all")
  const kinds = CATEGORIES.map((c) => ({
    category: c,
    count: places.filter((p) => p.category === c).length,
  })).filter((k) => k.count > 0)
  const shown = tab === "all" ? places : places.filter((p) => p.category === tab)

  return (
    <div className="space-y-6">
      {kinds.length > 1 ? (
        <div
          role="group"
          aria-label={t("search.byKind")}
          className="-mx-4 scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {[{ category: "all" as const, count: places.length }, ...kinds].map(
            ({ category, count }) => {
              const active = tab === category
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTab(category)}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-2 pr-4 pl-2 text-sm font-semibold transition-colors",
                    category === "all" && "pl-4",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/15 bg-card hover:border-foreground",
                  )}
                >
                  {category === "all" ? null : (
                    <LineBullet line={CATEGORY_META[category].line} size="xs">
                      {CATEGORY_META[category].bullet}
                    </LineBullet>
                  )}
                  {category === "all" ? t("search.all") : t(`categories.${category}.title`)}
                  <span
                    className={cn("tabular-nums", active ? "opacity-80" : "text-muted-foreground")}
                  >
                    {count}
                  </span>
                </button>
              )
            },
          )}
        </div>
      ) : null}
      <PlaceGrid places={shown} />
    </div>
  )
}
