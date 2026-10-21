/** Words worth searching for in a broken link like /place/katzs-deli. */
export function guessQuery(pathname: string): string {
  let last = pathname.split("/").filter(Boolean).at(-1) ?? ""
  try {
    last = decodeURIComponent(last)
  } catch {
    // A malformed escape: search for the raw text instead
  }
  const words = last
    .replace(/\.\w+$/, "")
    .replace(/[-_+]+/g, " ")
    .replace(/[^\p{L}\p{N}' ]/gu, "")
    .trim()
  return words.length >= 3 ? words.slice(0, 60) : ""
}
