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

/**
 * Namespaces only a page or two read in the browser. They are left out of
 * every page's messages too, and those pages add them back by wrapping the
 * components in <WithMessages>; the test checks no other browser code uses them.
 */
export const PAGE_NAMESPACES = [
  "walks",
  "tips",
  "goldenHour",
  "next",
  "passport",
  "guides",
] as const

export type PageNamespace = (typeof PAGE_NAMESPACES)[number]

export function clientMessages<M extends Record<string, unknown>>(messages: M): Partial<M> {
  const skip = new Set<string>([...SERVER_ONLY_NAMESPACES, ...PAGE_NAMESPACES])
  return Object.fromEntries(Object.entries(messages).filter(([ns]) => !skip.has(ns))) as Partial<M>
}
