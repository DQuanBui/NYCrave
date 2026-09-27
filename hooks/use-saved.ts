"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * Saved places live in localStorage for now (Supabase auth later).
 * One store shared by every component, synced across tabs via the storage event.
 */
const KEY = "nycrave:saved:v1"
const CHANGE = "nycrave:saved-change"
const EMPTY: string[] = []

let cachedRaw: string | null = null
let cachedSlugs: string[] = EMPTY

function read(): string[] {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(KEY)
  } catch {
    return EMPTY
  }
  if (raw === cachedRaw) return cachedSlugs
  cachedRaw = raw
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : []
    cachedSlugs = Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : EMPTY
  } catch {
    cachedSlugs = EMPTY
  }
  return cachedSlugs
}

function write(slugs: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs))
  } catch {
    // Storage full or blocked (private mode): saving silently becomes session-less.
  }
  window.dispatchEvent(new Event(CHANGE))
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(CHANGE, onChange)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(CHANGE, onChange)
  }
}

export function useSaved() {
  const slugs = useSyncExternalStore(subscribe, read, () => EMPTY)

  const toggle = useCallback((slug: string) => {
    const current = read()
    write(current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current])
  }, [])

  const isSaved = useCallback((slug: string) => slugs.includes(slug), [slugs])

  return { slugs, toggle, isSaved }
}
