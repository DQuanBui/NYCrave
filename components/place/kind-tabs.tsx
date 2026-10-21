"use client"

import { useTranslations } from "next-intl"
import { LineBullet } from "@/components/brand/line-bullet"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/types/enums"
import type { Category } from "@/types/place"

export type KindTab = Category | "all"

/**
 * Pills for each kind of place in a mixed list, with counts. Renders nothing
 * when the list holds only one kind.
 */
export function KindTabs({
  places,
  value,
  onChange,
  label,
}: {
  places: { category: Category }[]
  value: KindTab
  onChange: (tab: KindTab) => void
  label: string
}) {
  const t = useTranslations()
  const kinds = CATEGORIES.map((c) => ({
    category: c,
    count: places.filter((p) => p.category === c).length,
  })).filter((k) => k.count > 0)
  if (kinds.length < 2) return null

  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {[{ category: "all" as const, count: places.length }, ...kinds].map(({ category, count }) => {
        const active = value === category
        return (
          <button
            key={category}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category)}
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
            <span className={cn("tabular-nums", active ? "opacity-80" : "text-muted-foreground")}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** The places in a tab, or all of them. */
export function inKind<P extends { category: Category }>(places: P[], tab: KindTab): P[] {
  return tab === "all" ? places : places.filter((p) => p.category === tab)
}
