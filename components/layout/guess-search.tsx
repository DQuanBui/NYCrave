"use client"

import { Search } from "lucide-react"
import { Link, usePathname } from "@/i18n/navigation"
import { guessQuery } from "@/lib/guess-query"

/**
 * On the 404 page: offer to search for whatever the broken link was after,
 * since the search forgives typos ("katzs dely" still finds Katz's).
 */
export function GuessSearch({ label }: { label: string }) {
  const query = guessQuery(usePathname())
  if (!query) return null
  return (
    <Link
      href={{ pathname: "/search", query: { q: query } }}
      className="inline-flex items-center gap-2 rounded-full bg-taxi px-5 py-2.5 font-bold text-taxi-foreground"
    >
      <Search aria-hidden className="size-4" />
      {label.replace("{query}", query)}
    </Link>
  )
}
