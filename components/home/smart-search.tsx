"use client"

import { Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useMemo, useState } from "react"
import { LineBullet } from "@/components/brand/line-bullet"
import { useRouter } from "@/i18n/navigation"
import { normalizeQuery } from "@/lib/search"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/place"

/** The minimum needed to suggest a place while typing. */
export type SearchHint = { slug: string; name: string; neighborhood: string; category: Category }

type SmartSearchProps = {
  defaultValue?: string
  autoFocus?: boolean
  className?: string
  /** Places to suggest by name as the user types. */
  hints?: SearchHint[]
}

const MAX_SUGGESTIONS = 5

/**
 * Free-text search with place suggestions (ARIA combobox): arrow keys move through
 * the list, Enter opens the highlighted place or runs the search, Escape closes it.
 */
export function SmartSearch({ defaultValue = "", autoFocus, className, hints = [] }: SmartSearchProps) {
  const t = useTranslations("search")
  const router = useRouter()
  const id = useId()
  const listId = `${id}-list`
  const [query, setQuery] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const suggestions = useMemo(() => {
    const q = normalizeQuery(query)
    if (q.length < 2) return []
    return hints
      .map((h) => ({ h, at: normalizeQuery(h.name).indexOf(q) }))
      // Match names anywhere, neighborhoods by prefix ("flush" finds Flushing places)
      .filter((m) => m.at !== -1 || normalizeQuery(m.h.neighborhood).startsWith(q))
      .sort((a, b) => (a.at === -1 ? 99 : a.at) - (b.at === -1 ? 99 : b.at))
      .slice(0, MAX_SUGGESTIONS)
      .map((m) => m.h)
  }, [query, hints])

  const expanded = open && suggestions.length > 0
  const go = (hint: SearchHint) => {
    setOpen(false)
    router.push(`/place/${hint.slug}`)
  }

  return (
    <div className={cn("relative", className)}>
      <form
        role="search"
        className="flex h-14 items-center gap-2 rounded-full border-2 border-foreground bg-card pr-1.5 pl-5 shadow-[4px_4px_0_0_var(--foreground)] transition-shadow focus-within:ring-4 focus-within:ring-taxi sm:h-16"
        onSubmit={(e) => {
          e.preventDefault()
          if (expanded && active >= 0) return go(suggestions[active])
          const q = query.trim()
          if (q) router.push({ pathname: "/search", query: { q } })
        }}
      >
        <label htmlFor={id} className="sr-only">
          {t("label")}
        </label>
        <Search aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <input
          id={id}
          name="q"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
          enterKeyHint="search"
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!expanded) return
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setActive((i) => (i + 1) % suggestions.length)
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
            } else if (e.key === "Escape") {
              setOpen(false)
            }
          }}
          placeholder={t("placeholder")}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/80 focus-visible:outline-none sm:text-lg"
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded-full bg-taxi px-5 font-bold text-taxi-foreground transition-transform active:scale-95 sm:h-12 sm:px-6"
        >
          {t("submit")}
        </button>
      </form>

      <ul
        id={listId}
        role="listbox"
        aria-label={t("suggestPlaces")}
        hidden={!expanded}
        className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border-2 border-foreground bg-card py-1 shadow-xl"
      >
        {suggestions.map((hint, i) => {
          const meta = CATEGORY_META[hint.category]
          return (
            <li
              key={hint.slug}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(hint)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-4 py-2.5",
                i === active && "bg-accent",
              )}
            >
              <LineBullet line={meta.line} size="sm">
                {meta.bullet}
              </LineBullet>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{hint.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{hint.neighborhood}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

