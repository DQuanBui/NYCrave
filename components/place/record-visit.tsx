"use client"

import { useEffect } from "react"
import { useRecent } from "@/hooks/use-recent"

/** Adds the place being viewed to this device's recently viewed list. */
export function RecordVisit({ slug }: { slug: string }) {
  const { record } = useRecent()
  useEffect(() => record(slug), [record, slug])
  return null
}
