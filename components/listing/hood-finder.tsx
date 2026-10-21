"use client"

import { ArrowRight, MapPin } from "lucide-react"
import { useId, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { normalizeQuery } from "@/lib/search"

/**
 * Jump straight to a neighborhood by typing its name. The browser offers the
 * names as you type (a datalist); a close match by prefix counts too.
 */
export function HoodFinder({
  hoods,
  label,
  placeholder,
  go,
  notFound,
}: {
  hoods: { slug: string; name: string }[]
  label: string
  placeholder: string
  go: string
  /** Shown when nothing matches; "{query}" is replaced with what was typed. */
  notFound: string
}) {
  const router = useRouter()
  const id = useId()
  const [query, setQuery] = useState("")
  const [missed, setMissed] = useState<string | null>(null)

  const find = (q: string) => {
    const n = normalizeQuery(q)
    if (!n) return undefined
    return (
      hoods.find((h) => normalizeQuery(h.name) === n) ??
      hoods.find((h) => normalizeQuery(h.name).startsWith(n))
    )
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const hood = find(query)
        if (hood) router.push(`/neighborhoods/${hood.slug}`)
        else setMissed(query.trim())
      }}
      className="max-w-xl space-y-2"
    >
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id={id}
            list={`${id}-names`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setMissed(null)
            }}
            placeholder={placeholder}
            autoComplete="off"
            aria-describedby={missed ? `${id}-missed` : undefined}
            className="h-12 w-full rounded-full border-2 border-foreground/15 bg-card pr-4 pl-10 font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground focus-visible:border-foreground"
          />
          <datalist id={`${id}-names`}>
            {hoods.map((h) => (
              <option key={h.slug} value={h.name} />
            ))}
          </datalist>
        </div>
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-5 font-bold text-background"
        >
          {go}
          <ArrowRight aria-hidden className="size-4" />
        </button>
      </div>
      <p id={`${id}-missed`} aria-live="polite" className="text-sm text-muted-foreground">
        {missed ? notFound.replace("{query}", missed) : null}
      </p>
    </form>
  )
}
