/**
 * Proxies a Google Places photo so the API key stays on the server.
 * Photo names look like "places/{placeId}/photos/{photoId}".
 */
const NAME = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/

export async function GET(request: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return new Response("Not configured", { status: 501 })

  const params = new URL(request.url).searchParams
  const name = params.get("name") ?? ""
  const width = Math.min(Math.max(Number(params.get("w")) || 800, 100), 1600)
  if (!NAME.test(name)) return new Response("Bad photo name", { status: 400 })

  const upstream = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${width}&key=${key}`,
    { cache: "no-store" },
  )
  const type = upstream.headers.get("content-type") ?? ""
  if (!upstream.ok || !type.startsWith("image/")) {
    return new Response("Photo unavailable", { status: 502 })
  }
  return new Response(upstream.body, {
    headers: {
      "content-type": type,
      // Short, browser-only caching; Google content is not stored server-side
      "cache-control": "private, max-age=3600",
    },
  })
}
