import type { Borough } from "@/types/place"

export type Neighborhood = {
  slug: string
  name: string
  borough: Borough
  /** Approximate center, for distance estimates and map framing only. */
  lat: number
  lng: number
}

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    slug: "financial-district",
    name: "Financial District",
    borough: "manhattan",
    lat: 40.7075,
    lng: -74.0113,
  },
  { slug: "chinatown", name: "Chinatown", borough: "manhattan", lat: 40.7158, lng: -73.997 },
  {
    slug: "lower-east-side",
    name: "Lower East Side",
    borough: "manhattan",
    lat: 40.715,
    lng: -73.9843,
  },
  { slug: "soho", name: "SoHo", borough: "manhattan", lat: 40.7233, lng: -74.003 },
  { slug: "east-village", name: "East Village", borough: "manhattan", lat: 40.7265, lng: -73.9815 },
  { slug: "west-village", name: "West Village", borough: "manhattan", lat: 40.7358, lng: -74.0036 },
  { slug: "union-square", name: "Union Square", borough: "manhattan", lat: 40.7359, lng: -73.9911 },
  {
    slug: "meatpacking-district",
    name: "Meatpacking District",
    borough: "manhattan",
    lat: 40.7409,
    lng: -74.008,
  },
  { slug: "chelsea", name: "Chelsea", borough: "manhattan", lat: 40.7465, lng: -74.0014 },
  { slug: "nomad", name: "NoMad", borough: "manhattan", lat: 40.7448, lng: -73.988 },
  { slug: "koreatown", name: "Koreatown", borough: "manhattan", lat: 40.7477, lng: -73.9869 },
  { slug: "midtown", name: "Midtown", borough: "manhattan", lat: 40.7549, lng: -73.984 },
  { slug: "midtown-east", name: "Midtown East", borough: "manhattan", lat: 40.7527, lng: -73.9727 },
  {
    slug: "upper-west-side",
    name: "Upper West Side",
    borough: "manhattan",
    lat: 40.787,
    lng: -73.9754,
  },
  {
    slug: "upper-east-side",
    name: "Upper East Side",
    borough: "manhattan",
    lat: 40.7736,
    lng: -73.9566,
  },
  { slug: "harlem", name: "Harlem", borough: "manhattan", lat: 40.8116, lng: -73.9465 },
  { slug: "williamsburg", name: "Williamsburg", borough: "brooklyn", lat: 40.7081, lng: -73.9571 },
  { slug: "greenpoint", name: "Greenpoint", borough: "brooklyn", lat: 40.7305, lng: -73.9515 },
  { slug: "dumbo", name: "DUMBO", borough: "brooklyn", lat: 40.7033, lng: -73.9881 },
  {
    slug: "brooklyn-heights",
    name: "Brooklyn Heights",
    borough: "brooklyn",
    lat: 40.696,
    lng: -73.9936,
  },
  { slug: "park-slope", name: "Park Slope", borough: "brooklyn", lat: 40.671, lng: -73.9814 },
  { slug: "bushwick", name: "Bushwick", borough: "brooklyn", lat: 40.6944, lng: -73.9213 },
  { slug: "sunset-park", name: "Sunset Park", borough: "brooklyn", lat: 40.6455, lng: -74.0124 },
  { slug: "flushing", name: "Flushing", borough: "queens", lat: 40.758, lng: -73.8303 },
  { slug: "astoria", name: "Astoria", borough: "queens", lat: 40.7644, lng: -73.9235 },
  {
    slug: "jackson-heights",
    name: "Jackson Heights",
    borough: "queens",
    lat: 40.7557,
    lng: -73.8831,
  },
  {
    slug: "long-island-city",
    name: "Long Island City",
    borough: "queens",
    lat: 40.7447,
    lng: -73.9485,
  },
  { slug: "belmont", name: "Belmont", borough: "bronx", lat: 40.8551, lng: -73.8876 },
  { slug: "mott-haven", name: "Mott Haven", borough: "bronx", lat: 40.8091, lng: -73.9229 },
  { slug: "st-george", name: "St. George", borough: "staten_island", lat: 40.6437, lng: -74.0765 },
]

export function findNeighborhood(name: string): Neighborhood | undefined {
  const needle = name.trim().toLowerCase()
  return NEIGHBORHOODS.find((n) => n.name.toLowerCase() === needle || n.slug === needle)
}

export function neighborhoodByName(name: string): Neighborhood | undefined {
  return NEIGHBORHOODS.find((n) => n.name === name)
}
