import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { toSlug } from "@/lib/place-filters"
import { countByType, TYPE_KINDS, typeMessageKey, type TypeKind } from "@/lib/type-browse"
import { cn } from "@/lib/utils"
import type { Place } from "@/types/place"

const VISIBLE = 12

/** Emoji tiles with live counts, for the types that have places. */
export async function TypeGrid({ kind, pool }: { kind: TypeKind; pool: Place[] }) {
  const t = await getTranslations()
  const k = TYPE_KINDS[kind]
  const items = countByType(kind, pool).filter((item) => item.count > 0)
  if (items.length === 0) return null
  const headingId = `browse-${kind}`

  const tile = (item: (typeof items)[number]) => {
    const label = t(typeMessageKey(kind, item.value))
    const body = (
      <>
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-2xl"
        >
          {k.emoji[item.value]}
        </span>
        <span className="min-w-0">
          <span className="block leading-tight font-bold text-balance break-words hyphens-auto">
            {label}
          </span>
          <span className="block text-xs font-semibold text-muted-foreground">
            {t("listing.count", { count: item.count })}
          </span>
        </span>
      </>
    )
    return (
      <li key={item.value}>
        <Link
          href={`${k.base}/${toSlug(item.value)}`}
          className="flex items-center gap-3 rounded-xl border-2 border-transparent bg-card p-3 transition-colors hover:border-foreground"
        >
          {body}
        </Link>
      </li>
    )
  }

  const gridClass = "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <h2 id={headingId} className="font-display text-display-md">
        {t(`browse.${kind}`)}
      </h2>
      <ul className={gridClass}>{items.slice(0, VISIBLE).map(tile)}</ul>
      {items.length > VISIBLE ? (
        <details className="group">
          <summary className="text-sm font-semibold underline-offset-4 hover:underline">
            <span className="group-open:hidden">
              {t("browse.showAll", { count: items.length })}
            </span>
            <span className="hidden group-open:inline">{t("browse.showFewer")}</span>
          </summary>
          <ul className={cn(gridClass, "mt-3")}>{items.slice(VISIBLE).map(tile)}</ul>
        </details>
      ) : null}
    </section>
  )
}
