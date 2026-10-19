/**
 * Message namespaces used only by server components (pages and their async
 * parts, through getTranslations). They are left out of the messages sent to
 * the browser, which every page would otherwise carry in full. Anything not
 * listed here is sent, so a new namespace is safe by default; the test in
 * tests/client-messages.test.ts checks no browser-side code reads these.
 */
export const SERVER_ONLY_NAMESPACES = [
  "neighborhoods",
  "food",
  "seasons",
  "privacy",
  "browse",
  "sun",
  "credits",
  "meta",
  "listing",
  "offline",
  "notFound",
] as const

export function clientMessages<M extends Record<string, unknown>>(messages: M): Partial<M> {
  const skip = new Set<string>(SERVER_ONLY_NAMESPACES)
  return Object.fromEntries(Object.entries(messages).filter(([ns]) => !skip.has(ns))) as Partial<M>
}
