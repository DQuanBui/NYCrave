/**
 * Turns "nycrave.vercel.app", "https://nycrave.vercel.app/" or "" into a clean
 * origin, or undefined when the value is not a usable URL.
 */
export function toOrigin(value: string | undefined): string | undefined {
  const raw = value?.trim()
  if (!raw) return undefined
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).origin
  } catch {
    return undefined
  }
}

/**
 * Canonical origin for metadata, sitemaps and share links: NEXT_PUBLIC_SITE_URL
 * when set, otherwise the address Vercel gives the deployment, otherwise local.
 */
export const SITE_URL =
  toOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
  toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  toOrigin(process.env.VERCEL_URL) ??
  "http://localhost:3000"
