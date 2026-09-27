/**
 * When to ask for feedback: only after someone has really used the site, and
 * rarely. Kept free of browser APIs so it can be tested.
 */

export type FeedbackMemory = {
  /** Pages seen on this device, across visits. */
  views: number
  /** Saved a place or a day: a sign the site was useful enough to judge. */
  engaged: boolean
  /** When the card was last shown or dismissed. */
  askedAt?: number
  /** When feedback was last sent. */
  sentAt?: number
}

export const EMPTY_MEMORY: FeedbackMemory = { views: 0, engaged: false }

const DAY = 24 * 60 * 60 * 1000
/** After "Not now", wait this long before asking again. */
export const ASK_AGAIN_AFTER = 45 * DAY
/** After sending feedback, wait this long. */
export const ASK_AFTER_SENT = 180 * DAY
/** Pages to see before asking: fewer once they have saved something. */
export const VIEWS_WHEN_ENGAGED = 3
export const VIEWS_OTHERWISE = 8

export function shouldAsk(m: FeedbackMemory, now: number): boolean {
  if (m.sentAt && now - m.sentAt < ASK_AFTER_SENT) return false
  if (m.askedAt && now - m.askedAt < ASK_AGAIN_AFTER) return false
  return m.views >= (m.engaged ? VIEWS_WHEN_ENGAGED : VIEWS_OTHERWISE)
}

export function parseMemory(raw: unknown): FeedbackMemory {
  if (!raw || typeof raw !== "object") return EMPTY_MEMORY
  const r = raw as Record<string, unknown>
  const time = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined)
  return {
    views: typeof r.views === "number" && r.views >= 0 ? Math.floor(r.views) : 0,
    engaged: r.engaged === true,
    askedAt: time(r.askedAt),
    sentAt: time(r.sentAt),
  }
}
