"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { isAdmin, signIn, signOut } from "@/lib/admin-auth"
import { getGooglePlaceDetails } from "@/lib/google-places"
import { savePlace, syncSeedToSupabase } from "@/lib/place-store"
import { getPlaceById, getPlaces } from "@/lib/places"
import { placeSchema } from "@/types/place"

export type ActionState = { ok?: string; errors?: string[]; json?: string }

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Not signed in")
}

export async function loginAction(_: ActionState, form: FormData): Promise<ActionState> {
  const ok = await signIn(String(form.get("password") ?? ""))
  if (!ok) return { errors: ["That password is not correct."] }
  revalidatePath("/admin")
  return {}
}

export async function logoutAction() {
  await signOut()
  revalidatePath("/admin")
}

function parsePlaceJson(json: string) {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch (e) {
    return { errors: [`Invalid JSON: ${(e as Error).message}`] }
  }
  const result = placeSchema.safeParse({ ...(raw as object), updatedAt: new Date().toISOString() })
  if (!result.success) {
    return {
      errors: result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    }
  }
  return { place: result.data }
}

/** The place editor posts here; the pressed button's intent picks save or Google import. */
export async function editorAction(prev: ActionState, form: FormData): Promise<ActionState> {
  return form.get("intent") === "google" ? importFromGoogle(form) : savePlaceFromForm(form)
}

async function savePlaceFromForm(form: FormData): Promise<ActionState> {
  await requireAdmin()
  const json = String(form.get("json") ?? "")
  const parsed = parsePlaceJson(json)
  if (!parsed.place) return { errors: parsed.errors, json }

  const place = parsed.place
  const clash = (await getPlaces()).find((p) => p.slug === place.slug && p.id !== place.id)
  if (clash) return { errors: [`slug: already used by ${clash.name}`], json }
  if (place.verified && place.verificationNotes?.includes("TODO")) {
    return { errors: ["verificationNotes: remove the TODO notes before marking as verified"], json }
  }

  try {
    await savePlace(place)
  } catch (e) {
    return { errors: [(e as Error).message], json }
  }
  revalidatePath("/", "layout")
  return { ok: `Saved ${place.name}.`, json: JSON.stringify(place, null, 2) }
}

/** Prefills hours, phone and website from Google. The editor still has to review and save. */
async function importFromGoogle(form: FormData): Promise<ActionState> {
  await requireAdmin()
  const json = String(form.get("json") ?? "")
  let draft: Record<string, unknown>
  try {
    draft = JSON.parse(json)
  } catch (e) {
    return { errors: [`Invalid JSON: ${(e as Error).message}`], json }
  }
  const id = z.string().min(1).safeParse(draft.googlePlaceId)
  if (!id.success) return { errors: ["Set googlePlaceId first."], json }

  const details = await getGooglePlaceDetails(id.data, String(draft.name ?? ""))
  if (!details)
    return { errors: ["Google Places returned nothing (check the key and place id)."], json }

  const next = {
    ...draft,
    ...(details.hours ? { hours: details.hours } : {}),
    ...(details.phone ? { phone: details.phone } : {}),
    ...(details.website ? { website: details.website } : {}),
    verificationNotes: [
      draft.verificationNotes,
      "Hours, phone and website imported from Google: confirm with the business.",
    ]
      .filter(Boolean)
      .join(" "),
  }
  return { ok: "Imported from Google. Review, then save.", json: JSON.stringify(next, null, 2) }
}

export async function setVerifiedAction(form: FormData) {
  await requireAdmin()
  const place = await getPlaceById(String(form.get("id")))
  if (!place) return
  const verified = form.get("verified") === "1"
  await savePlace({
    ...place,
    verified,
    verificationNotes: verified ? undefined : place.verificationNotes,
    updatedAt: new Date().toISOString(),
  })
  revalidatePath("/", "layout")
}

export async function syncSeedAction(): Promise<ActionState> {
  await requireAdmin()
  try {
    const count = await syncSeedToSupabase()
    revalidatePath("/", "layout")
    return { ok: `Synced ${count} places to Supabase.` }
  } catch (e) {
    return { errors: [(e as Error).message] }
  }
}
