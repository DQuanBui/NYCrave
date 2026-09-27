import type { LineColor } from "@/lib/lines"
import { formatHHMM } from "./params"
import type { Interest, Mood, Pace, PlanInput } from "./types"

/** Ready-made days: a starting point and a mood, planned fresh for today. */
export type DayPreset = {
  id: "classic" | "foodie" | "waterfront" | "artsy" | "date" | "budget"
  line: LineColor
  from: string
  mood: Mood
  start: number
  end: number
  budget: number
  pace: Pace
  interests: Interest[]
}

export const DAY_PRESETS: DayPreset[] = [
  {
    id: "classic",
    line: "blue",
    from: "midtown",
    mood: "first_timer",
    start: 9 * 60,
    end: 22 * 60,
    budget: 150,
    pace: "relaxed",
    interests: ["museums", "views"],
  },
  {
    id: "foodie",
    line: "red",
    from: "chinatown",
    mood: "foodie",
    start: 10 * 60,
    end: 22 * 60,
    budget: 100,
    pace: "packed",
    interests: ["food", "coffee"],
  },
  {
    id: "waterfront",
    line: "green",
    from: "dumbo",
    mood: "chill",
    start: 10 * 60,
    end: 21 * 60,
    budget: 80,
    pace: "relaxed",
    interests: ["parks", "photos", "views"],
  },
  {
    id: "artsy",
    line: "purple",
    from: "upper-east-side",
    mood: "artsy",
    start: 10 * 60,
    end: 20 * 60,
    budget: 120,
    pace: "relaxed",
    interests: ["museums", "art"],
  },
  {
    id: "date",
    line: "orange",
    from: "west-village",
    mood: "romantic",
    start: 16 * 60,
    end: 23 * 60 + 30,
    budget: 150,
    pace: "relaxed",
    interests: ["nightlife", "views"],
  },
  {
    id: "budget",
    line: "yellow",
    from: "lower-east-side",
    mood: "adventurous",
    start: 10 * 60,
    end: 22 * 60,
    budget: 50,
    pace: "packed",
    interests: [],
  },
]

export function presetInput(preset: DayPreset, date: string): PlanInput {
  return {
    date,
    start: preset.start,
    end: preset.end,
    from: preset.from,
    budget: preset.budget,
    mood: preset.mood,
    interests: preset.interests,
    dietary: [],
    pace: preset.pace,
    weatherAware: true,
  }
}

/** Same shape as planQuery, kept short for links. */
export function presetQuery(preset: DayPreset, date: string): Record<string, string> {
  const q: Record<string, string> = {
    d: date,
    s: formatHHMM(preset.start),
    e: formatHHMM(preset.end),
    from: preset.from,
    b: String(preset.budget),
    m: preset.mood,
    pace: preset.pace,
  }
  if (preset.interests.length) q.i = preset.interests.join(",")
  return q
}
