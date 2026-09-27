/* NYCrave service worker: offline fallback and offline copies of saved places. */
const VERSION = "v1"
const STATIC_CACHE = `nycrave-static-${VERSION}`
const PAGE_CACHE = `nycrave-pages-${VERSION}`
const SAVED_CACHE = `nycrave-saved-${VERSION}`
const OFFLINE_URL = "/offline"
const MAX_PAGES = 40

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  const keep = new Set([STATIC_CACHE, PAGE_CACHE, SAVED_CACHE])
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/maplibre/") ||
  url.pathname === "/icon" ||
  url.pathname === "/apple-icon"

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)))
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) (await caches.open(STATIC_CACHE)).put(request, response.clone())
  return response
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE)
      await cache.put(request, response.clone())
      trim(PAGE_CACHE, MAX_PAGES)
    }
    return response
  } catch {
    return (
      (await caches.match(request, { ignoreSearch: false })) ||
      (await caches.match(OFFLINE_URL)) ||
      Response.error()
    )
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request))
  } else if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request))
  }
})

/** Keeps the saved-places cache in step with the list the page sends. */
async function syncSaved(urls) {
  const cache = await caches.open(SAVED_CACHE)
  const wanted = new Set(urls.map((u) => new URL(u, self.location.origin).href))
  for (const request of await cache.keys()) {
    if (!wanted.has(request.url) && !request.url.includes("/_next/static/"))
      await cache.delete(request)
  }
  for (const href of wanted) {
    if (await cache.match(href)) continue
    try {
      const response = await fetch(href)
      if (!response.ok) continue
      const html = await response.clone().text()
      await cache.put(href, response)
      // Also keep the scripts and styles the page needs to render offline
      const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) || [])]
      const statics = await caches.open(STATIC_CACHE)
      await Promise.all(
        assets.map(async (asset) => {
          if (await statics.match(asset)) return
          const res = await fetch(asset)
          if (res.ok) await statics.put(asset, res)
        }),
      )
    } catch {
      // Offline or failed: try again on the next sync
    }
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "sync-saved" && Array.isArray(event.data.urls)) {
    event.waitUntil(syncSaved(event.data.urls))
  }
})
