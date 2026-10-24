"use client"

import { Check, HeartPlus } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { PlaceGrid } from "@/components/place/place-grid"
import { useHydrated } from "@/hooks/use-now"
import { useSaved } from "@/hooks/use-saved"
import type { CardPlace } from "@/lib/card-place"
import { MAX_SHARED } from "@/lib/shared-list"

/** Places someone shared by link, with one tap to save them all. */
export function SharedList({ places }: { places: CardPlace[] }) {
  const t = useTranslations("saved")
  const hydrated = useHydrated()
  const { isSaved, saveMany } = useSaved()
  const missing = places.filter((p) => !isSaved(p.slug))
  const done = hydrated && missing.length === 0

  return (
    <section
      aria-labelledby="shared-title"
      className="space-y-5 rounded-3xl border-2 border-dashed border-foreground/30 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 id="shared-title" className="font-display text-display-md">
            {t("sharedTitle")}
          </h2>
          <p className="text-muted-foreground">{t("sharedBody")}</p>
        </div>
        <button
          type="button"
          disabled={!hydrated || done}
          onClick={() => saveMany(missing.map((p) => p.slug))}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-taxi px-5 font-bold text-taxi-foreground transition-transform hover:-translate-y-px disabled:translate-y-0 disabled:opacity-70"
        >
          {done ? (
            <Check aria-hidden className="size-4" />
          ) : (
            <HeartPlus aria-hidden className="size-4" />
          )}
          <span aria-live="polite">
            {done ? t("allSaved") : t("saveAll", { count: places.length })}
          </span>
        </button>
      </div>
      <PlaceGrid places={places} />
    </section>
  )
}

/**
 * The list from a shared link (/saved?list=slug,slug), read in the browser so
 * the Saved page itself can be cached. Unknown slugs are ignored.
 */
export function SharedFromLink({ places }: { places: CardPlace[] }) {
  const t = useTranslations("saved")
  const wanted = useSearchParams().get("list")?.split(",").slice(0, MAX_SHARED) ?? []
  const shared = wanted
    .map((slug) => places.find((p) => p.slug === slug))
    .filter((p): p is CardPlace => p !== undefined)
  if (shared.length === 0) return null
  return (
    <>
      <SharedList places={shared} />
      <h2 className="font-display text-display-md">{t("yours")}</h2>
    </>
  )
}
