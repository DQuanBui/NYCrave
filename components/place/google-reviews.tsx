import { Star } from "lucide-react"
import { getTranslations } from "next-intl/server"
import type { GooglePlaceDetails } from "@/lib/google-places"

/** Review snippets from the official Google Places API, each with its author attribution. */
export async function GoogleReviews({ details }: { details: GooglePlaceDetails }) {
  const t = await getTranslations("place")
  if (!details.reviews.length && details.rating === undefined) return null

  return (
    <section aria-labelledby="reviews" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="reviews" className="font-display text-display-sm sm:text-3xl">
          {t("reviewsTitle")}
        </h2>
        {details.rating !== undefined ? (
          <p className="flex items-center gap-1.5 font-semibold">
            <Star aria-hidden className="size-4 fill-line-yellow text-line-yellow" />
            {t("googleRating", {
              rating: details.rating.toFixed(1),
              count: details.ratingCount ?? 0,
            })}
          </p>
        ) : null}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {details.reviews.slice(0, 4).map((r) => (
          <li
            key={`${r.authorName}-${r.relativeTime}`}
            className="space-y-2 rounded-xl border bg-card p-4"
          >
            <p className="flex flex-wrap items-center gap-x-2 text-sm">
              {r.authorUrl ? (
                <a
                  href={r.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:underline"
                >
                  {r.authorName}
                </a>
              ) : (
                <span className="font-bold">{r.authorName}</span>
              )}
              <span className="text-muted-foreground">{r.relativeTime}</span>
            </p>
            <p className="flex gap-0.5" role="img" aria-label={t("stars", { rating: r.rating })}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  aria-hidden
                  className={
                    i < Math.round(r.rating)
                      ? "size-3.5 fill-line-yellow text-line-yellow"
                      : "size-3.5 text-muted-foreground/40"
                  }
                />
              ))}
            </p>
            <p className="line-clamp-6 text-sm leading-relaxed">{r.text}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        {t("reviewsAttribution")}{" "}
        {details.mapsUri ? (
          <a
            href={details.mapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            {t("seeOnGoogle")}
          </a>
        ) : null}
      </p>
    </section>
  )
}
