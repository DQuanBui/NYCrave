"use client"

import { useCallback, useSyncExternalStore } from "react"
import { createLocalStore } from "@/lib/local-store"

/** Saved places live in localStorage for now (Supabase auth later). */
const store = createLocalStore<string[]>(
  "nycrave:saved:v1",
  (raw) => (Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string") : []),
  [],
)

export function useSaved() {
  const slugs = useSyncExternalStore(store.subscribe, store.read, () => store.empty)

  const toggle = useCallback((slug: string) => {
    const current = store.read()
    store.write(current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current])
  }, [])

  const isSaved = useCallback((slug: string) => slugs.includes(slug), [slugs])

  return { slugs, toggle, isSaved }
}

export type SavedDay = { url: string; label: string; savedAt: number }

const dayStore = createLocalStore<SavedDay[]>(
  "nycrave:days:v1",
  (raw) =>
    Array.isArray(raw)
      ? raw.filter(
          (d): d is SavedDay =>
            typeof d?.url === "string" &&
            typeof d?.label === "string" &&
            typeof d?.savedAt === "number",
        )
      : [],
  [],
)

/** Planned days saved on this device, newest first. */
export function useSavedDays() {
  const days = useSyncExternalStore(dayStore.subscribe, dayStore.read, () => dayStore.empty)

  const save = useCallback((day: Omit<SavedDay, "savedAt">) => {
    const rest = dayStore.read().filter((d) => d.url !== day.url)
    dayStore.write([{ ...day, savedAt: Date.now() }, ...rest])
  }, [])

  const remove = useCallback((url: string) => {
    dayStore.write(dayStore.read().filter((d) => d.url !== url))
  }, [])

  return { days, save, remove, has: (url: string) => days.some((d) => d.url === url) }
}
