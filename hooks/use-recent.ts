"use client"

import { useCallback, useSyncExternalStore } from "react"
import { createLocalStore } from "@/lib/local-store"

/** How many places the history keeps. */
export const RECENT_MAX = 12

/** Places opened on this device, newest first. Never leaves the browser. */
const store = createLocalStore<string[]>(
  "nycrave:recent:v1",
  (raw) =>
    Array.isArray(raw)
      ? raw.filter((s): s is string => typeof s === "string").slice(0, RECENT_MAX)
      : [],
  [],
)

export function useRecent() {
  const slugs = useSyncExternalStore(store.subscribe, store.read, () => store.empty)

  const record = useCallback((slug: string) => {
    const current = store.read()
    if (current[0] === slug) return
    store.write([slug, ...current.filter((s) => s !== slug)].slice(0, RECENT_MAX))
  }, [])

  const clear = useCallback(() => store.write([]), [])

  return { slugs, record, clear }
}
