import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { z } from "zod"
import { writeBackend } from "@/lib/place-store"
import { supabaseWriter } from "@/lib/supabase"

/**
 * Visitor reports about a place. Stored like admin writes: Supabase when it is
 * configured, a local JSON file in development, nowhere otherwise.
 */

export const REPORT_KINDS = ["closed", "hours", "location", "photo", "other"] as const

export const reportInputSchema = z.object({
  placeId: z.string().min(1).max(120),
  kind: z.enum(REPORT_KINDS),
  note: z.string().trim().max(500).optional(),
})

export type ReportInput = z.infer<typeof reportInputSchema>
export type Report = ReportInput & { id: string; resolved: boolean; createdAt: string }

const FILE = path.join(process.cwd(), "data", "reports.json")

async function readJson(): Promise<Report[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Report[]
  } catch {
    return []
  }
}

export const reportsEnabled = () => writeBackend() !== "readonly"

export async function saveReport(input: ReportInput): Promise<void> {
  const backend = writeBackend()
  if (backend === "readonly") throw new Error("Reports are not set up")
  if (backend === "supabase") {
    const { error } = await supabaseWriter()!
      .from("reports")
      .insert({ place_id: input.placeId, kind: input.kind, note: input.note || null })
    if (error) throw new Error(error.message)
    return
  }
  const list = await readJson()
  list.push({
    ...input,
    note: input.note || undefined,
    id: String(Date.now()),
    resolved: false,
    createdAt: new Date().toISOString(),
  })
  await writeFile(FILE, `${JSON.stringify(list, null, 2)}\n`)
}

/** Open reports, newest first. */
export async function openReports(): Promise<Report[]> {
  const backend = writeBackend()
  if (backend === "readonly") return []
  if (backend === "supabase") {
    const { data, error } = await supabaseWriter()!
      .from("reports")
      .select("id, place_id, kind, note, resolved, created_at")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(200)
    if (error) throw new Error(error.message)
    return (data ?? []).map((r) => ({
      id: String(r.id),
      placeId: r.place_id,
      kind: r.kind,
      note: r.note ?? undefined,
      resolved: r.resolved,
      createdAt: r.created_at,
    }))
  }
  return (await readJson())
    .filter((r) => !r.resolved)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function resolveReport(id: string): Promise<void> {
  const backend = writeBackend()
  if (backend === "supabase") {
    const { error } = await supabaseWriter()!
      .from("reports")
      .update({ resolved: true })
      .eq("id", Number(id))
    if (error) throw new Error(error.message)
  } else if (backend === "json") {
    const list = await readJson()
    await writeFile(
      FILE,
      `${JSON.stringify(
        list.map((r) => (r.id === id ? { ...r, resolved: true } : r)),
        null,
        2,
      )}\n`,
    )
  }
}
