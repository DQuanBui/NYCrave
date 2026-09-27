import Image from "next/image"
import { LINES } from "@/lib/lines"
import { placeEmoji } from "@/lib/place-display"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import type { Place } from "@/types/place"

type PlacePhotoProps = {
  place: Place
  sizes: string
  priority?: boolean
  className?: string
  /** Visual scale of the placeholder emoji. */
  emojiSize?: "md" | "lg"
}

/**
 * The first photo of a place, or subway-tile placeholder art in its line color.
 * Third-party photos always carry their attribution.
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
      <figure className={cn("relative overflow-hidden", className)}>
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={photo.source === "google_places"}
          className="object-cover"
        />
        {photo.attribution ? (
          <figcaption className="absolute right-0 bottom-0 rounded-tl-md bg-black/60 px-2 py-0.5 text-[0.65rem] text-white">
            {photo.attribution.url ? (
              <a
                href={photo.attribution.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {photo.attribution.text}
              </a>
            ) : (
              photo.attribution.text
            )}
          </figcaption>
        ) : null}
      </figure>
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
