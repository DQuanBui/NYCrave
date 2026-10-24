"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Hero } from "@/components/home/hero"
import { NycNow } from "@/components/home/nyc-now"
import { PlaceRail, type PlaceRailProps } from "@/components/place/place-rail"
import { useNow } from "@/hooks/use-now"
import type { CardPlace } from "@/lib/card-place"
import { holidayOn } from "@/lib/holidays"
import { nycDateString } from "@/lib/hours"

type HeroForecast = NonNullable<React.ComponentProps<typeof Hero>["forecast"]>

/** The home page's live parts, from /api/now (see app/api/now/route.ts). */
type LiveHomeData = {
  openCount: number
  open: CardPlace[]
  free: CardPlace[]
  forecast: HeroForecast | null
}

const LiveHomeContext = createContext<LiveHomeData | null>(null)

// One request per page view, however many times the provider mounts
let request: Promise<LiveHomeData | null> | undefined
const loadLive = () =>
  (request ??= fetch("/api/now")
    .then((r) => (r.ok ? (r.json() as Promise<LiveHomeData>) : null))
    .catch(() => null)
    .finally(() => setTimeout(() => (request = undefined), 60_000)))

/**
 * The home page is cached for hours; what changes by the minute (what is open,
 * today's forecast) comes from one small cached request made in the browser.
 */
export function LiveHomeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<LiveHomeData | null>(null)
  useEffect(() => {
    loadLive().then(setData)
  }, [])
  return <LiveHomeContext.Provider value={data}>{children}</LiveHomeContext.Provider>
}

export function LiveHero() {
  const data = useContext(LiveHomeContext)
  const now = useNow()
  // Today's holiday, from the visitor's clock rather than when the page was cached
  const holiday = now ? holidayOn(nycDateString(now)) : undefined
  return <Hero forecast={data?.forecast ?? null} holiday={holiday} />
}

export function LiveNycNow({ sunrise, sunset }: { sunrise: number; sunset: number }) {
  const data = useContext(LiveHomeContext)
  return <NycNow openCount={data?.openCount ?? null} sunrise={sunrise} sunset={sunset} />
}

/** "Open now" or "Free today", filled from /api/now and re-checked against the clock. */
export function LiveRail({
  kind,
  ...props
}: Omit<PlaceRailProps, "places" | "loading"> & { kind: "open" | "free" }) {
  const data = useContext(LiveHomeContext)
  return <PlaceRail {...props} places={data?.[kind] ?? []} loading={!data} />
}
