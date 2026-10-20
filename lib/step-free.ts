import type { LatLng } from "@/lib/geo"
import { nearestStations } from "@/lib/subway"

/** The longest walk to a step-free station that still counts as "nearby". */
export const STEP_FREE_WALK = 10

/**
 * Whether a place has a subway station with elevators or ramps (the ADA field in
 * the MTA's station data) within a short walk. Server only: it loads the station
 * list, which client bundles should not carry.
 */
export function hasStepFreeStation(place: LatLng): boolean {
  return nearestStations(place, 4, STEP_FREE_WALK).some((s) => s.ada)
}
