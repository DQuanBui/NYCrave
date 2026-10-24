"use client"

import { History, Search, X } from "lucide-react"
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
  /** Places to suggest by name; loaded from /api/places/hints when not given. */
  hints?: SearchHint[]
}

const MAX_SUGGESTIONS = 5
const MAX_RECENT = 5
const RECENT_KEY = "nycrave:recent-searches"

function readRecent(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")
    return Array.isArray(list) ? list.filter((q) => typeof q === "string").slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function saveRecent(q: string) {
  try {
    const list = [q, ...readRecent().filter((r) => normalizeQuery(r) !== normalizeQuery(q))]
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)))
  } catch {}
}

// One request per visit, shared by every search box
let hintsRequest: Promise<SearchHint[]> | undefined
function loadHints(): Promise<SearchHint[]> {
  hintsRequest ??= fetch("/api/places/hints")
    .then((r) => (r.ok ? (r.json() as Promise<SearchHint[]>) : []))
    .catch(() => {
      hintsRequest = undefined
      return []
    })
  return hintsRequest
}

type Option =
  { kind: "place"; hint: SearchHint } | { kind: "recent"; query: string } | { kind: "clear" }

/**
 * Free-text search with place suggestions (ARIA combobox): arrow keys move through
 * the list, Enter opens the highlighted place or runs the search, Escape closes it.
 * With the box empty, the list offers this browser's recent searches instead.
 */
export function SmartSearch({
  defaultValue = "",
  autoFocus,
  className,
  hints: given,
}: SmartSearchProps) {
  const t = useTranslations("search")
  const router = useRouter()
  const id = useId()
  const listId = `${id}-list`
  const [query, setQuery] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [recent, setRecent] = useState<string[]>([])
  const [loaded, setLoaded] = useState<SearchHint[]>([])
  const hints = given ?? loaded

  const suggestions = useMemo(() => {
    const q = normalizeQuery(query)
    if (q.length < 2) return []
    return (
      hints
        .map((h) => ({ h, at: normalizeQuery(h.name).indexOf(q) }))
        // Match names anywhere, neighborhoods by prefix ("flush" finds Flushing places)
        .filter((m) => m.at !== -1 || normalizeQuery(m.h.neighborhood).startsWith(q))
        .sort((a, b) => (a.at === -1 ? 99 : a.at) - (b.at === -1 ? 99 : b.at))
        .slice(0, MAX_SUGGESTIONS)
        .map((m) => m.h)
    )
  }, [query, hints])

  const options: Option[] =
    query.trim() === ""
      ? recent.length > 0
        ? [...recent.map((q) => ({ kind: "recent" as const, query: q })), { kind: "clear" }]
        : []
      : suggestions.map((hint) => ({ kind: "place", hint }))
  const showingRecent = options[0]?.kind === "recent"
  const expanded = open && options.length > 0

  const search = (q: string) => {
    setOpen(false)
    saveRecent(q)
    router.push({ pathname: "/search", query: { q } })
  }
  const choose = (option: Option) => {
    if (option.kind === "clear") {
      try {
        localStorage.removeItem(RECENT_KEY)
      } catch {}
      setRecent([])
      setActive(-1)
      return
    }
    if (option.kind === "recent") {
      setQuery(option.query)
      return search(option.query)
    }
    setOpen(false)
    router.push(`/place/${option.hint.slug}`)
  }

  return (
    <div className={cn("relative", className)}>
      <form
        role="search"
        className="flex h-14 items-center gap-2 rounded-full border-2 border-foreground bg-card pr-1.5 pl-5 shadow-[4px_4px_0_0_var(--foreground)] transition-shadow focus-within:ring-4 focus-within:ring-taxi sm:h-16"
        onSubmit={(e) => {
          e.preventDefault()
          if (expanded && active >= 0) return choose(options[active])
          const q = query.trim()
          if (q) search(q)
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
          onFocus={() => {
            if (!given && loaded.length === 0) loadHints().then(setLoaded)
            setRecent(readRecent())
            setOpen(true)
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!expanded) return
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setActive((i) => (i + 1) % options.length)
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setActive((i) => (i <= 0 ? options.length - 1 : i - 1))
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
        aria-label={showingRecent ? t("recent") : t("suggestPlaces")}
        hidden={!expanded}
        className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border-2 border-foreground bg-card py-1 shadow-xl"
      >
        {options.map((option, i) => {
          const key =
            option.kind === "place"
              ? option.hint.slug
              : option.kind === "recent"
                ? `recent-${option.query}`
                : "clear"
          return (
            <li
              key={key}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(option)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-4 py-2.5",
                option.kind === "clear" && "border-t py-2 text-sm text-muted-foreground",
                i === active && "bg-accent",
              )}
            >
              {option.kind === "place" ? (
                <>
                  <LineBullet line={CATEGORY_META[option.hint.category].line} size="sm">
                    {CATEGORY_META[option.hint.category].bullet}
                  </LineBullet>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{option.hint.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.hint.neighborhood}
                    </span>
                  </span>
                </>
              ) : option.kind === "recent" ? (
                <>
                  <History aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-semibold">{option.query}</span>
                </>
              ) : (
                <>
                  <X aria-hidden className="size-4 shrink-0" />
                  {t("clearRecent")}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
