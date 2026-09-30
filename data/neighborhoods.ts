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
  {
    slug: "governors-island",
    name: "Governors Island",
    borough: "manhattan",
    lat: 40.6894,
    lng: -74.0167,
  },
  { slug: "tribeca", name: "Tribeca", borough: "manhattan", lat: 40.7163, lng: -74.0086 },
  { slug: "chinatown", name: "Chinatown", borough: "manhattan", lat: 40.7158, lng: -73.997 },
  {
    slug: "lower-east-side",
    name: "Lower East Side",
    borough: "manhattan",
    lat: 40.715,
    lng: -73.9843,
  },
  { slug: "soho", name: "SoHo", borough: "manhattan", lat: 40.7233, lng: -74.003 },
  { slug: "noho", name: "NoHo", borough: "manhattan", lat: 40.7262, lng: -73.9925 },
  { slug: "nolita", name: "Nolita", borough: "manhattan", lat: 40.7223, lng: -73.9955 },
  { slug: "little-italy", name: "Little Italy", borough: "manhattan", lat: 40.7191, lng: -73.9973 },
  { slug: "east-village", name: "East Village", borough: "manhattan", lat: 40.7265, lng: -73.9815 },
  { slug: "west-village", name: "West Village", borough: "manhattan", lat: 40.7358, lng: -74.0036 },
  {
    slug: "greenwich-village",
    name: "Greenwich Village",
    borough: "manhattan",
    lat: 40.7314,
    lng: -73.9969,
  },
  { slug: "union-square", name: "Union Square", borough: "manhattan", lat: 40.7359, lng: -73.9911 },
  { slug: "flatiron", name: "Flatiron", borough: "manhattan", lat: 40.7411, lng: -73.9897 },
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
  {
    slug: "hells-kitchen",
    name: "Hell's Kitchen",
    borough: "manhattan",
    lat: 40.7638,
    lng: -73.9918,
  },
  { slug: "midtown-east", name: "Midtown East", borough: "manhattan", lat: 40.7527, lng: -73.9727 },
  { slug: "murray-hill", name: "Murray Hill", borough: "manhattan", lat: 40.7479, lng: -73.9757 },
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
  {
    slug: "washington-heights",
    name: "Washington Heights",
    borough: "manhattan",
    lat: 40.8417,
    lng: -73.9394,
  },
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
  {
    slug: "carroll-gardens",
    name: "Carroll Gardens",
    borough: "brooklyn",
    lat: 40.6795,
    lng: -73.9992,
  },
  { slug: "cobble-hill", name: "Cobble Hill", borough: "brooklyn", lat: 40.6862, lng: -73.9962 },
  { slug: "fort-greene", name: "Fort Greene", borough: "brooklyn", lat: 40.6897, lng: -73.9745 },
  { slug: "park-slope", name: "Park Slope", borough: "brooklyn", lat: 40.671, lng: -73.9814 },
  { slug: "gowanus", name: "Gowanus", borough: "brooklyn", lat: 40.6733, lng: -73.9892 },
  { slug: "flatbush", name: "Flatbush", borough: "brooklyn", lat: 40.6415, lng: -73.9594 },
  {
    slug: "prospect-heights",
    name: "Prospect Heights",
    borough: "brooklyn",
    lat: 40.6746,
    lng: -73.9656,
  },
  { slug: "bushwick", name: "Bushwick", borough: "brooklyn", lat: 40.6944, lng: -73.9213 },
  { slug: "sunset-park", name: "Sunset Park", borough: "brooklyn", lat: 40.6455, lng: -74.0124 },
  { slug: "bay-ridge", name: "Bay Ridge", borough: "brooklyn", lat: 40.6264, lng: -74.0299 },
  { slug: "coney-island", name: "Coney Island", borough: "brooklyn", lat: 40.5755, lng: -73.9707 },
  { slug: "flushing", name: "Flushing", borough: "queens", lat: 40.758, lng: -73.8303 },
  {
    slug: "flushing-meadows",
    name: "Flushing Meadows",
    borough: "queens",
    lat: 40.7453,
    lng: -73.8448,
  },
  { slug: "astoria", name: "Astoria", borough: "queens", lat: 40.7644, lng: -73.9235 },
  { slug: "woodside", name: "Woodside", borough: "queens", lat: 40.7453, lng: -73.9055 },
  {
    slug: "jackson-heights",
    name: "Jackson Heights",
    borough: "queens",
    lat: 40.7557,
    lng: -73.8831,
  },
  { slug: "corona", name: "Corona", borough: "queens", lat: 40.7475, lng: -73.862 },
  {
    slug: "long-island-city",
    name: "Long Island City",
    borough: "queens",
    lat: 40.7447,
    lng: -73.9485,
  },
  { slug: "belmont", name: "Belmont", borough: "bronx", lat: 40.8551, lng: -73.8876 },
  { slug: "riverdale", name: "Riverdale", borough: "bronx", lat: 40.8997, lng: -73.9126 },
  { slug: "bronx-park", name: "Bronx Park", borough: "bronx", lat: 40.8575, lng: -73.8766 },
  { slug: "mott-haven", name: "Mott Haven", borough: "bronx", lat: 40.8091, lng: -73.9229 },
  { slug: "concourse", name: "Concourse", borough: "bronx", lat: 40.8272, lng: -73.9223 },
  { slug: "fordham", name: "Fordham", borough: "bronx", lat: 40.861, lng: -73.8905 },
  { slug: "pelham-bay", name: "Pelham Bay", borough: "bronx", lat: 40.8651, lng: -73.8078 },
  { slug: "city-island", name: "City Island", borough: "bronx", lat: 40.8468, lng: -73.7867 },
  { slug: "st-george", name: "St. George", borough: "staten_island", lat: 40.6437, lng: -74.0765 },
  {
    slug: "new-brighton",
    name: "New Brighton",
    borough: "staten_island",
    lat: 40.6425,
    lng: -74.098,
  },
  {
    slug: "lighthouse-hill",
    name: "Lighthouse Hill",
    borough: "staten_island",
    lat: 40.5763,
    lng: -74.1383,
  },
]

export function findNeighborhood(name: string): Neighborhood | undefined {
  const needle = name.trim().toLowerCase()
  return NEIGHBORHOODS.find((n) => n.name.toLowerCase() === needle || n.slug === needle)
}

export function neighborhoodByName(name: string): Neighborhood | undefined {
  return NEIGHBORHOODS.find((n) => n.name === name)
}
