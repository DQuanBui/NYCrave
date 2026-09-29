"use client"

import { useCallback, useSyncExternalStore } from "react"
import { createLocalStore } from "@/lib/local-store"
import { newlyEarned, parseStamps, type BadgeKey, type Stamp, type Stamps } from "@/lib/passport"

/** Passport stamps live on the device, like saved places. */
export const PASSPORT_KEY = "nycrave:passport:v1"
const store = createLocalStore<Stamps>(PASSPORT_KEY, parseStamps, {})

export function usePassport() {
  const stamps = useSyncExternalStore(store.subscribe, store.read, () => store.empty)

  /** Stamps a place and returns the badges it unlocked. */
  const stamp = useCallback((slug: string, value: Stamp): BadgeKey[] => {
    const before = store.read()
    if (before[slug]) return []
    const after = { ...before, [slug]: value }
    store.write(after)
    return newlyEarned(before, after)
  }, [])

  const remove = useCallback((slug: string) => {
    const rest = { ...store.read() }
    delete rest[slug]
    store.write(rest)
  }, [])

  return { stamps, stamp, remove }
}
