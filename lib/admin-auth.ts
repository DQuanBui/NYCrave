import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

/**
 * Single-password admin gate for adding and verifying places. The cookie holds an
 * HMAC derived from ADMIN_PASSWORD, so rotating the password signs everyone out.
 */

const COOKIE = "nycrave_admin"
const MAX_AGE = 60 * 60 * 8

export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

function sessionToken(): string {
  return createHmac("sha256", process.env.ADMIN_PASSWORD!)
    .update("nycrave-admin-session-v1")
    .digest("hex")
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false
  const value = (await cookies()).get(COOKIE)?.value
  return value ? safeEqual(value, sessionToken()) : false
}

export async function signIn(password: string): Promise<boolean> {
  if (!adminEnabled() || !safeEqual(password, process.env.ADMIN_PASSWORD!)) return false
  ;(await cookies()).set(COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  })
  return true
}

export async function signOut() {
  ;(await cookies()).delete(COOKIE)
}
