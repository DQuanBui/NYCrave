"use client"

import "maplibre-gl/dist/maplibre-gl.css"
import { setWorkerUrl, type StyleSpecification } from "maplibre-gl"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
  type MapRef,
} from "react-map-gl/maplibre"
import { LineBullet } from "@/components/brand/line-bullet"
import { Link } from "@/i18n/navigation"
import type { LineColor } from "@/lib/lines"
import { cn } from "@/lib/utils"

export type MapPoint = {
  id: string
  lat: number
  lng: number
  name: string
  subtitle?: string
  href?: string
  line: LineColor
  /** Text inside the marker bullet: a category letter or a stop number. */
  label: string
}

export type MapViewProps = {
  points: MapPoint[]
  /** Connect points in order with a route line (Design My Day). */
  route?: boolean
  className?: string
  ariaLabel: string
  /** Controlled selection: when set, the parent shows the details instead of a popup. */
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  /** Require two fingers / Ctrl+scroll to move the map (for maps embedded in a page). */
  cooperative?: boolean
  /** A "you are here" dot; the map flies there when it first appears. */
  userLocation?: { lat: number; lng: number } | null
  /** Room to keep clear when fitting points, e.g. under overlaid controls. */
  padding?: { top: number; bottom: number; left: number; right: number }
  controlsPosition?: "top-right" | "bottom-right"
  /** Start here instead of fitting every point (the fit still runs on later changes). */
  initialView?: { longitude: number; latitude: number; zoom: number }
}

// Served from public/ (see scripts/copy-maplibre-worker.mjs)
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs")

const NYC = { longitude: -73.95, latitude: 40.73, zoom: 10.5 }
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

/** OpenFreeMap (OpenStreetMap data, no key) by default; Mapbox raster tiles when a token is set. */
function mapStyle(dark: boolean): string | StyleSpecification {
  if (!MAPBOX_TOKEN) return `https://tiles.openfreemap.org/styles/${dark ? "dark" : "positron"}`
  return {
    version: 8,
    sources: {
      base: {
        type: "raster",
        tiles: [
          `https://api.mapbox.com/styles/v1/mapbox/${dark ? "dark-v11" : "light-v11"}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
        ],
        tileSize: 512,
        attribution: "© Mapbox © OpenStreetMap contributors",
      },
    },
    layers: [{ id: "base", type: "raster", source: "base" }],
  }
}

function boundsOf(points: MapPoint[]): [[number, number], [number, number]] {
  const lngs = points.map((p) => p.lng)
  const lats = points.map((p) => p.lat)
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
}

export default function MapView({
  points,
  route,
  className,
  ariaLabel,
  selectedId: controlledId,
  onSelect,
  cooperative = true,
  userLocation,
  padding = { top: 60, bottom: 60, left: 60, right: 60 },
  controlsPosition = "top-right",
  initialView,
}: MapViewProps) {
  const t = useTranslations("filters")
  const { resolvedTheme } = useTheme()
  const mapRef = useRef<MapRef>(null)
  const [ownId, setOwnId] = useState<string | null>(null)
  const controlled = onSelect !== undefined
  const selectedId = controlled ? (controlledId ?? null) : ownId
  const setSelectedId = controlled ? onSelect : setOwnId
  const selected = points.find((p) => p.id === selectedId)

  const initialViewState = useMemo(() => {
    if (initialView) return initialView
    if (points.length === 0) return NYC
    if (points.length === 1) return { longitude: points[0].lng, latitude: points[0].lat, zoom: 14 }
    return { bounds: boundsOf(points), fitBoundsOptions: { padding, maxZoom: 15 } }
    // Only for the first render; later changes refit below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const key = points.map((p) => p.id).join(",")
  const firstKey = useRef(key)
  useEffect(() => {
    const map = mapRef.current
    if (!map || points.length === 0) return
    if (initialView && key === firstKey.current) return
    if (points.length === 1) map.flyTo({ center: [points[0].lng, points[0].lat], zoom: 14 })
    else map.fitBounds(boundsOf(points), { padding, maxZoom: 15, duration: 600 })
    // Refit when the set of points changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const hasUser = Boolean(userLocation)
  useEffect(() => {
    if (userLocation)
      mapRef.current?.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14 })
    // Fly once when the location arrives, not on every position update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUser])

  const routeData = useMemo(
    () => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: points.map((p) => [p.lng, p.lat]) },
    }),
    [points],
  )

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn("relative overflow-hidden rounded-2xl border", className)}
    >
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={mapStyle(resolvedTheme === "dark")}
        style={{ width: "100%", height: "100%" }}
        cooperativeGestures={cooperative}
        onClick={() => controlled && setSelectedId(null)}
      >
        <NavigationControl position={controlsPosition} showCompass={false} />
        {route && points.length > 1 ? (
          <Source id="route" type="geojson" data={routeData}>
            <Layer
              id="route-casing"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": "#1d1f21", "line-width": 9 }}
            />
            <Layer
              id="route-line"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": "#fccc0a", "line-width": 5 }}
            />
          </Source>
        ) : null}
        {userLocation ? (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <span className="relative grid size-5 place-items-center" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-line-blue/40 motion-reduce:animate-none" />
              <span className="size-3.5 rounded-full bg-line-blue ring-3 ring-white" />
            </span>
          </Marker>
        ) : null}
        {points.map((p) => (
          <Marker
            key={p.id}
            longitude={p.lng}
            latitude={p.lat}
            anchor="center"
            style={{ zIndex: p.id === selectedId ? 2 : 1 }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedId(p.id)
              }}
              aria-label={p.name}
              aria-pressed={controlled ? p.id === selectedId : undefined}
              className={cn(
                "block rounded-full transition-transform hover:scale-110 focus-visible:scale-110",
                p.id === selectedId && "scale-125",
              )}
            >
              <LineBullet
                line={p.line}
                size="md"
                className={cn(
                  "shadow-md ring-2 ring-white",
                  p.id === selectedId && "ring-4 ring-foreground",
                )}
              >
                {p.label}
              </LineBullet>
            </button>
          </Marker>
        ))}
        {selected && !controlled ? (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="bottom"
            offset={22}
            onClose={() => setSelectedId(null)}
            closeButton
            maxWidth="16rem"
          >
            <div className="space-y-1 pr-4 text-[#1d1f21]">
              <p className="font-bold">{selected.name}</p>
              {selected.subtitle ? (
                <p className="text-xs text-[#53575b]">{selected.subtitle}</p>
              ) : null}
              {selected.href ? (
                <Link
                  href={selected.href}
                  className="text-sm font-semibold underline underline-offset-2"
                >
                  {t("viewPlace")}
                </Link>
              ) : null}
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  )
}
