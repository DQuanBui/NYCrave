import { PhotoLightbox } from "@/components/place/photo-lightbox"
import { PlacePhoto } from "@/components/place/place-photo"
import type { Photo, Place } from "@/types/place"

/**
 * The place page gallery: a swipeable strip whose photos open full screen. Every
 * third-party photo shows its author attribution. With no photos, falls back to
 * the line-color placeholder art.
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
  return <PhotoLightbox photos={photos} className={className} />
}
