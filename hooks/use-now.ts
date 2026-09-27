"use client"

import { useSyncExternalStore } from "react"

/**
 * The current time, shared by every live badge and refreshed every 30 seconds.
 * Returns null during server rendering and hydration so time-dependent UI
 * renders a placeholder instead of mismatching.
 */
const TICK_MS = 30_000
let now = 0
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    now = Date.now()
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, TICK_MS)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) clearInterval(timer)
  }
}

function getSnapshot() {
  return now || (now = Date.now())
}

export function useNow(): Date | null {
  const ms = useSyncExternalStore(subscribe, getSnapshot, () => 0)
  return ms ? new Date(ms) : null
}

const noopSubscribe = () => () => {}

/** True after hydration; false on the server and during the first client render. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}
