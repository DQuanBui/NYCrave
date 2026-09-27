"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { MapViewProps } from "@/components/map/map-view"
import { cn } from "@/lib/utils"

const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-2xl" />,
})

/**
 * MapLibre is ~280 kB and busy on startup, so the map mounts only when it scrolls
 * near the viewport. The box keeps its size throughout, so nothing shifts.
 */
export function LazyMap({ className, ...props }: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn("relative", className)}>
      {visible ? (
        <MapView {...props} className="size-full" />
      ) : (
        <Skeleton className="size-full rounded-2xl" />
      )}
    </div>
  )
}

export type { MapPoint } from "@/components/map/map-view"
