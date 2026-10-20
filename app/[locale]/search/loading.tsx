import { getTranslations } from "next-intl/server"
import { PlaceCardSkeleton } from "@/components/place/place-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

/** Shown while search results load. */
export default async function SearchLoading() {
  const t = await getTranslations("search")
  return (
    <div aria-busy className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-8 lg:py-12">
      <h1 className="sr-only">{t("loading")}</h1>
      <div className="space-y-5">
        <Skeleton className="h-14 w-3/4 max-w-2xl rounded-lg" />
        <Skeleton className="h-16 w-full max-w-2xl rounded-full" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <PlaceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
