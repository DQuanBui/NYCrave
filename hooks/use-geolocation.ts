"use client"

import { useCallback, useState } from "react"
import type { LatLng } from "@/lib/geo"

export type GeoState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "ready"; position: LatLng }
  | { status: "denied" }

/** Asks for the viewer's position only when they press a button, never on page load. */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" })

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ status: "denied" })
      return
    }
    setState({ status: "locating" })
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: "ready",
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        }),
      () => setState({ status: "denied" }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    )
  }, [])

  const reset = useCallback(() => setState({ status: "idle" }), [])

  return { state, locate, reset }
}
