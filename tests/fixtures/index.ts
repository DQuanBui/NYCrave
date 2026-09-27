import { z } from "zod"
import { placeSchema } from "@/types/place"
import raw from "./places.json"

/**
 * Frozen sample places for logic tests, so hours, search and planner assertions
 * do not change when the real seed data in data/*.json is edited.
 */
export const fixturePlaces = z.array(placeSchema).parse(raw)
