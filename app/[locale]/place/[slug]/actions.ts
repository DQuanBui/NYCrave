"use server"

import { headers } from "next/headers"
import { getPlaceById } from "@/lib/places"
import { reportInputSchema, saveReport } from "@/lib/report-store"

export type ReportState = { status?: "sent" | "error" | "limited" }

// A few reports per visitor per 10 minutes is plenty; this only stops floods
const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 5
const recent = new Map<string, number[]>()

function allow(key: string): boolean {
  const now = Date.now()
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (hits.length >= LIMIT) return false
  recent.set(key, [...hits, now])
  return true
}

export async function reportAction(_: ReportState, form: FormData): Promise<ReportState> {
  // Bots fill every field; people never see this one
  if (form.get("website")) return { status: "sent" }

  const parsed = reportInputSchema.safeParse({
    placeId: form.get("placeId"),
    kind: form.get("kind"),
    note: form.get("note") || undefined,
  })
  if (!parsed.success || !(await getPlaceById(parsed.data.placeId))) return { status: "error" }

  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local"
  if (!allow(ip)) return { status: "limited" }

  try {
    await saveReport(parsed.data)
    return { status: "sent" }
  } catch {
    return { status: "error" }
  }
}
