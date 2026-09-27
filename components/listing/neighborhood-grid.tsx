import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { LINES, type LineColor } from "@/lib/lines"
import { listingQuery } from "@/lib/place-filters"
import { cn } from "@/lib/utils"
import type { Place } from "@/types/place"

/** Neighborhoods ranked by how many places they have, linking to the filtered listing. */
export async function NeighborhoodGrid({
  pool,
  href,
  title,
  line,
}: {
  pool: Place[]
  href: string
  title: string
  line: LineColor
}) {
  const t = await getTranslations()
  const counts = new Map<string, { borough: Place["borough"]; count: number }>()
  for (const p of pool) {
    const entry = counts.get(p.neighborhood) ?? { borough: p.borough, count: 0 }
    entry.count++
    counts.set(p.neighborhood, entry)
  }
  const hoods = [...counts].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
  if (hoods.length === 0) return null

  return (
    <section aria-labelledby="hoods" className="space-y-4">
      <h2 id="hoods" className="font-display text-display-md">
        {title}
      </h2>
      <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {hoods.map(([name, { borough, count }]) => (
          <li key={name}>
            <Link
              href={{ pathname: href, query: listingQuery({ hood: name }) }}
              className="flex items-center gap-3 rounded-xl border-2 border-transparent bg-card p-3 transition-colors hover:border-foreground"
            >
              <span
                aria-hidden
                className={cn("h-10 w-1.5 shrink-0 rounded-full", LINES[line].bg)}
              />
              <span className="min-w-0">
                <span className="block truncate font-bold">{name}</span>
                <span className="block text-xs font-semibold text-muted-foreground">
                  {t(`borough.${borough}`)}, {t("listing.count", { count })}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
