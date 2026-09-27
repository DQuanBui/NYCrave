import { z } from "zod"
import { distanceKm } from "@/lib/geo"
import type { Place } from "@/types/place"
import { alternativesFor, originOf } from "./plan"
import { SLOTS, type Plan, type Slot } from "./types"

/**
 * LLM refinement is constrained to our own data: the model sees candidate lists
 * built here, and every pick is validated against them before the deterministic
 * planner re-checks hours, budget and dietary needs.
 */

export const selectionSchema = z.object({
  picks: z.array(
    z.object({
      slot: z.enum(SLOTS),
      placeId: z.string(),
      note: z.string(),
    }),
  ),
})

export type Selection = z.infer<typeof selectionSchema>

export type SlotCandidates = {
  slot: Slot
  start: number
  end: number
  current: string
  candidates: Place[]
}

export function buildCandidates(plan: Plan, places: Place[]): SlotCandidates[] {
  return plan.stops.map((stop) => {
    // Every other stop's place is reserved so picks cannot collide
    const reserved = new Set(plan.stops.filter((s) => s !== stop).map((s) => s.place.id))
    return {
      slot: stop.slot,
      start: stop.start,
      end: stop.end,
      current: stop.place.id,
      candidates: alternativesFor(plan.input, places, stop, reserved),
    }
  })
}

/** Compact, fact-only description of each option for the prompt. */
export function describeSlots(plan: Plan, slots: SlotCandidates[]) {
  let previous = originOf(plan.input.from)
  return slots.map((s) => {
    const from = previous
    previous = plan.stops.find((x) => x.slot === s.slot)!.place
    return {
      slot: s.slot,
      time: `${Math.floor(s.start / 60) % 24}:${String(s.start % 60).padStart(2, "0")}`,
      currentPick: s.current,
      candidates: s.candidates.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        neighborhood: p.neighborhood,
        kmFromPreviousStop: Math.round(distanceKm(from, p) * 10) / 10,
        priceLevel: p.isFree ? "free" : "$".repeat(p.priceLevel),
        tags: [
          ...(p.cuisines ?? []),
          ...(p.dishTypes ?? []),
          ...(p.drinkTypes ?? []),
          ...p.vibeTags,
        ],
        mustTry: p.mustTry,
        editorialTake: p.editorialTake,
      })),
    }
  })
}

/** Keeps only picks that name a real candidate for a real slot, one place per day. */
export function validateSelection(selection: Selection, slots: SlotCandidates[]) {
  const used = new Set<string>()
  const picks: { slot: Slot; placeId: string; note: string }[] = []
  for (const pick of selection.picks) {
    const slot = slots.find((s) => s.slot === pick.slot)
    if (!slot || !slot.candidates.some((p) => p.id === pick.placeId) || used.has(pick.placeId))
      continue
    if (picks.some((p) => p.slot === pick.slot)) continue
    used.add(pick.placeId)
    picks.push({ ...pick, note: pick.note.trim().slice(0, 200) })
  }
  return picks
}
