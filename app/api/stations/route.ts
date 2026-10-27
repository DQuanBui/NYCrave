import stations from "@/data/subway-stations.json"
import type { Station } from "@/lib/subway"

// Station data only changes with a deploy, so this is built once and cached
export const dynamic = "force-static"

/**
 * Every subway station (name, position, routes, step-free access), fetched by
 * "Lines near me" only when someone asks, so pages do not carry it.
 */
export async function GET() {
  return Response.json(
    (stations as Station[]).map(({ name, lat, lng, routes, ada }) => ({
      name,
      lat,
      lng,
      routes,
      ada,
    })),
  )
}
