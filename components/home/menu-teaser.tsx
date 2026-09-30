import { getTranslations } from "next-intl/server"
import { PlacePhoto } from "@/components/place/place-photo"
import { Link } from "@/i18n/navigation"
import { dishCover, DISHES } from "@/lib/food-guide"
import { LINES } from "@/lib/lines"
import { cn } from "@/lib/utils"
import type { Place } from "@/types/place"

/** A row of the city's signature dishes, each opening its spot in the food guide. */
export async function MenuTeaser({ places }: { places: Place[] }) {
  const t = await getTranslations("food")
  const dishes = DISHES.flatMap((dish) => {
    const cover = dishCover(dish, places)
    return cover ? [{ dish, cover }] : []
  })

  return (
    <section aria-labelledby="ny-menu" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="ny-menu" className="font-display text-display-md">
          {t("home.title")}
        </h2>
        <Link href="/food" className="text-sm font-bold underline underline-offset-4">
          {t("home.cta")}
        </Link>
      </div>
      <ul className="-mx-4 scrollbar-none flex gap-4 overflow-x-auto px-4 pt-1 pb-2 lg:mx-0 lg:px-0">
        {dishes.map(({ dish, cover }) => (
          <li key={dish.key} className="w-28 shrink-0 sm:w-32">
            <Link
              href={`/food#${dish.key}`}
              className="group flex flex-col items-center gap-2 text-center"
            >
              <span className="relative block">
                <PlacePhoto
                  place={cover}
                  sizes="128px"
                  showChip={false}
                  className="size-28 rounded-full ring-4 ring-card transition-transform duration-300 group-hover:scale-105 sm:size-32"
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute -right-1 -bottom-1 grid size-10 place-items-center rounded-full text-xl ring-4 ring-background transition-transform duration-300 group-hover:rotate-12",
                    LINES[dish.line].bg,
                  )}
                >
                  {dish.emoji}
                </span>
              </span>
              <span className="text-sm leading-tight font-bold">
                {t(`dishes.${dish.key}.name`)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
