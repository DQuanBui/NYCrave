import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { z } from "zod"
import { routing } from "@/i18n/routing"
import { FEEDBACK_FEATURES, MAX_FEEDBACK_CHARS } from "@/lib/feedback-options"
import { writeBackend } from "@/lib/place-store"
import { supabaseWriter } from "@/lib/supabase"

/**
 * Visitor feedback about the site itself: a 1 to 5 rating, the features they
 * used and an optional comment. Stored like reports: Supabase when configured,
 * a local JSON file in development, nowhere otherwise.
 */

export const feedbackInputSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  features: z.array(z.enum(FEEDBACK_FEATURES)).max(FEEDBACK_FEATURES.length).default([]),
  comment: z.string().trim().max(MAX_FEEDBACK_CHARS).optional(),
  locale: z.enum(routing.locales),
})

export type FeedbackInput = z.infer<typeof feedbackInputSchema>
export type Feedback = FeedbackInput & { id: string; createdAt: string }

const FILE = path.join(process.cwd(), "data", "feedback.json")

async function readJson(): Promise<Feedback[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Feedback[]
  } catch {
    return []
  }
}

export const feedbackEnabled = () => writeBackend() !== "readonly"

export async function saveFeedback(input: FeedbackInput): Promise<void> {
  const backend = writeBackend()
  if (backend === "readonly") throw new Error("Feedback is not set up")
  const comment = input.comment || undefined
  if (backend === "supabase") {
    const { error } = await supabaseWriter()!
      .from("feedback")
      .insert({
        rating: input.rating,
        features: input.features,
        comment: comment ?? null,
        locale: input.locale,
      })
    if (error) throw new Error(error.message)
    return
  }
  const list = await readJson()
  list.push({ ...input, comment, id: String(Date.now()), createdAt: new Date().toISOString() })
  await writeFile(FILE, `${JSON.stringify(list, null, 2)}\n`)
}

/** The latest feedback, newest first. */
export async function recentFeedback(limit = 200): Promise<Feedback[]> {
  const backend = writeBackend()
  if (backend === "readonly") return []
  if (backend === "supabase") {
    const { data, error } = await supabaseWriter()!
      .from("feedback")
      .select("id, rating, features, comment, locale, created_at")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) throw new Error(error.message)
    return (data ?? []).map((f) => ({
      id: String(f.id),
      rating: f.rating,
      features: f.features ?? [],
      comment: f.comment ?? undefined,
      locale: f.locale,
      createdAt: f.created_at,
    }))
  }
  return (await readJson()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
}

/** Average rating and how many people picked each score. */
export function summarizeFeedback(list: Pick<Feedback, "rating">[]) {
  const counts = [0, 0, 0, 0, 0]
  for (const f of list) counts[f.rating - 1]++
  const total = list.length
  const average = total ? list.reduce((sum, f) => sum + f.rating, 0) / total : 0
  return { total, average, counts }
}
