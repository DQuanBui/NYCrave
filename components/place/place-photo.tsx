import Image from "next/image"
import { useTranslations } from "next-intl"
import { LINES } from "@/lib/lines"
import { placeEmoji } from "@/lib/place-display"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import type { CardPlace } from "@/lib/card-place"

type PlacePhotoProps = {
  place: CardPlace
  sizes: string
  priority?: boolean
  className?: string
  /** Visual scale of the placeholder emoji. */
  emojiSize?: "md" | "lg"
}

/**
 * The first photo of a place, or subway-tile placeholder art in its line color.
 * Credits appear in the place gallery and on the photo credits page.
 */
export function PlacePhoto({
  place,
  sizes,
  priority,
  className,
  emojiSize = "md",
}: PlacePhotoProps) {
  const photo = place.photos[0]
  const line = LINES[CATEGORY_META[place.category].line]

  if (photo) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes={sizes}
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          unoptimized={photo.source === "google_places"}
          className="object-cover"
        />
        {photo.illustrative ? <IllustrativeChip /> : null}
      </div>
    )
  }

  return (
    <div aria-hidden className={cn("relative overflow-hidden", line.bg, line.fg, className)}>
      <div className="absolute inset-0 tile-pattern" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
      <span
        className={cn(
          "absolute inset-0 grid place-items-center drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]",
          emojiSize === "lg" ? "text-8xl sm:text-9xl" : "text-6xl",
        )}
      >
        {placeEmoji(place)}
      </span>
    </div>
  )
}

export function IllustrativeChip({ className }: { className?: string }) {
  const t = useTranslations("place")
  return (
    <span
      className={cn(
        "absolute bottom-2 left-2 rounded-sm bg-black/65 px-1.5 py-0.5 text-[0.65rem] font-semibold text-white",
        className,
      )}
    >
      {t("illustrative")}
    </span>
  )
}
