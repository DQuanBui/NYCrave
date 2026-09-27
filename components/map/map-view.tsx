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

export default function MapView({ points, route, className, ariaLabel }: MapViewProps) {
  const t = useTranslations("filters")
  const { resolvedTheme } = useTheme()
  const mapRef = useRef<MapRef>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = points.find((p) => p.id === selectedId)

  const initialViewState = useMemo(() => {
    if (points.length === 0) return NYC
    if (points.length === 1) return { longitude: points[0].lng, latitude: points[0].lat, zoom: 14 }
    return { bounds: boundsOf(points), fitBoundsOptions: { padding: 60, maxZoom: 15 } }
    // Only for the first render; later changes refit below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const key = points.map((p) => p.id).join(",")
  useEffect(() => {
    const map = mapRef.current
    if (!map || points.length === 0) return
    if (points.length === 1) map.flyTo({ center: [points[0].lng, points[0].lat], zoom: 14 })
    else map.fitBounds(boundsOf(points), { padding: 60, maxZoom: 15, duration: 600 })
    // Refit when the set of points changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

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
        cooperativeGestures
      >
        <NavigationControl position="top-right" showCompass={false} />
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
        {points.map((p) => (
          <Marker key={p.id} longitude={p.lng} latitude={p.lat} anchor="center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedId(p.id)
              }}
              aria-label={p.name}
              className="block rounded-full transition-transform hover:scale-110 focus-visible:scale-110"
            >
              <LineBullet line={p.line} size="md" className="shadow-md ring-2 ring-white">
                {p.label}
              </LineBullet>
            </button>
          </Marker>
        ))}
        {selected ? (
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
