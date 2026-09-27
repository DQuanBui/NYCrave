"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

/** MapLibre is ~200 kB; load it only when a map is actually shown. */
export const LazyMap = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl" />,
})

export type { MapPoint } from "@/components/map/map-view"
