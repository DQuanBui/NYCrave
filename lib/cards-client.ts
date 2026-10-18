import type { NextPlace } from "@/lib/whats-next"

/**
 * Every place as a card, fetched once per visit from the static cards route and
 * shared by the features that work in the browser (What's next, recently viewed).
 */
let cache: Promise<NextPlace[]> | null = null

export const loadCards = () =>
  (cache ??= fetch("/api/places/cards")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .catch((e) => {
      cache = null
      throw e
    }))
