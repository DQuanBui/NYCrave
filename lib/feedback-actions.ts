"use server"

import { headers } from "next/headers"
import { FEEDBACK_FEATURES } from "@/lib/feedback-options"
import { feedbackInputSchema, saveFeedback } from "@/lib/feedback-store"

export type FeedbackState = { status?: "sent" | "error" | "limited" }

// Two or three notes per visitor per 10 minutes is plenty; this only stops floods
const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 3
const recent = new Map<string, number[]>()

function allow(key: string): boolean {
  const now = Date.now()
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (hits.length >= LIMIT) return false
  recent.set(key, [...hits, now])
  return true
}

export async function feedbackAction(_: FeedbackState, form: FormData): Promise<FeedbackState> {
  // Bots fill every field; people never see this one
  if (form.get("website")) return { status: "sent" }

  const features = form
    .getAll("features")
    .map(String)
    .filter((f) => (FEEDBACK_FEATURES as readonly string[]).includes(f))
  const parsed = feedbackInputSchema.safeParse({
    rating: form.get("rating"),
    features: [...new Set(features)],
    comment: form.get("comment") || undefined,
    locale: form.get("locale"),
  })
  if (!parsed.success) return { status: "error" }

  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local"
  if (!allow(ip)) return { status: "limited" }

  try {
    await saveFeedback(parsed.data)
    return { status: "sent" }
  } catch {
    return { status: "error" }
  }
}
