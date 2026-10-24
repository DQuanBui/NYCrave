"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { LineBullet } from "@/components/brand/line-bullet"
import { OpenNowToggle } from "@/components/place/open-now-toggle"
import { PlaceGrid } from "@/components/place/place-grid"
import { useNow } from "@/hooks/use-now"
import type { CardPlace } from "@/lib/card-place"
import { getOpenStatus, isOpen } from "@/lib/hours"
import { CATEGORY_META } from "@/lib/taxonomy"
import type { Category } from "@/types/place"

/** A guide's places by category, with a switch to show only what is open now. */
export function GuideSections({
  sections,
  heading: Heading = "h2",
}: {
  sections: { category: Category; places: CardPlace[] }[]
  /** Heading level for each category, so sections nest under the page's own headings. */
  heading?: "h2" | "h3"
}) {
  const t = useTranslations()
  const now = useNow()
  const [openOnly, setOpenOnly] = useState(false)
  const filtering = openOnly && now !== null

  const shown = sections
    .map((s) => ({
      ...s,
      places: filtering ? s.places.filter((p) => isOpen(getOpenStatus(p.hours, now))) : s.places,
    }))
    .filter((s) => s.places.length > 0)
  const total = shown.reduce((n, s) => n + s.places.length, 0)

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center gap-3">
        <OpenNowToggle
          pressed={openOnly}
          onToggle={() => setOpenOnly((v) => !v)}
          label={t("guides.openNow")}
          className="h-11 px-5 text-base"
        />
        {filtering ? (
          <p aria-live="polite" className="text-sm font-semibold text-muted-foreground">
            {t("guides.openCount", { count: total })}
          </p>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-foreground/30 px-5 py-6 text-muted-foreground">
          {t("guides.noneOpen")}
        </p>
      ) : null}

      {shown.map(({ category, places }) => (
        <section
          key={category}
          id={category}
          aria-labelledby={`${category}-title`}
          className="scroll-mt-24 space-y-5"
        >
          <Heading
            id={`${category}-title`}
            className="flex items-center gap-3 font-display text-display-sm sm:text-display-md"
          >
            <LineBullet line={CATEGORY_META[category].line} size="md">
              {CATEGORY_META[category].bullet}
            </LineBullet>
            {t(`categories.${category}.title`)}
          </Heading>
          <PlaceGrid places={places} />
        </section>
      ))}
    </div>
  )
}
