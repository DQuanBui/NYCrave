import Image from "next/image"
import { IllustrativeChip, PlacePhoto } from "@/components/place/place-photo"
import { cn } from "@/lib/utils"
import type { Photo, Place } from "@/types/place"

/**
 * Swipeable gallery for the place page. Every third-party photo shows its author
 * attribution. With no photos, falls back to the line-color placeholder art.
 */
export function PhotoGallery({
  place,
  photos,
  className,
}: {
  place: Place
  photos: Photo[]
  className?: string
}) {
  if (photos.length === 0) {
    return <PlacePhoto place={place} priority emojiSize="lg" sizes="100vw" className={className} />
  }
  return (
    <ul
      className={cn("scrollbar-none flex snap-x snap-mandatory gap-1 overflow-x-auto", className)}
    >
      {photos.map((photo, i) => (
        <li
          key={photo.url}
          className={cn(
            "relative h-full shrink-0 snap-start overflow-hidden bg-muted",
            photos.length === 1 ? "w-full" : "w-[88%] sm:w-[60%] lg:w-[45%]",
          )}
        >
          <figure className="h-full">
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              preload={i === 0}
              fetchPriority={i === 0 ? "high" : undefined}
              sizes="(min-width: 1024px) 45vw, 90vw"
              // Proxied Google photos are fetched per view and must not be re-hosted
              unoptimized={photo.source === "google_places"}
              className="object-cover"
            />
            {photo.illustrative ? <IllustrativeChip className="top-2 bottom-auto" /> : null}
            {photo.attribution ? (
              <figcaption className="absolute right-0 bottom-0 rounded-tl-md bg-black/65 px-2 py-0.5 text-[0.7rem] text-white">
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
        </li>
      ))}
    </ul>
  )
}
