import { useTranslations } from "next-intl"
import { formatPriceRange } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Place } from "@/types/place"

export function PriceLevel({ place, className }: { place: Place; className?: string }) {
  const t = useTranslations("place")
  if (place.isFree) {
    return <span className={cn("font-bold text-free", className)}>{t("free")}</span>
  }
  if (place.ticketInfo) {
    return (
      <span className={cn("font-semibold tabular-nums", className)}>
        <span className="sr-only">{t("tickets")}: </span>
        {formatPriceRange(place.ticketInfo.priceRange)}
      </span>
    )
  }
  return (
    <span className={cn("font-semibold tabular-nums", className)}>
      <span aria-hidden>
        {"$".repeat(place.priceLevel)}
        <span className="text-muted-foreground/45">{"$".repeat(4 - place.priceLevel)}</span>
      </span>
      <span className="sr-only">{t("priceLevel", { level: place.priceLevel })}</span>
    </span>
  )
}
