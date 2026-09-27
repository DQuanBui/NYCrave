import { Fragment, type ReactNode } from "react"
import { Link } from "@/i18n/navigation"

/**
 * A tiny, safe Markdown subset for assistant replies: paragraphs, "-" and "1."
 * lists, **bold** and [links](url). Internal links stay in the app; nothing is
 * rendered as raw HTML.
 */
export function RichText({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const blocks = text.trim().split(/\n{2,}/)
  return (
    <div className="space-y-2.5">
      {blocks.map((block, b) => {
        const lines = block.split("\n").filter((l) => l.trim())
        const bullet = /^\s*(?:[-*•]|\d+[.)])\s+/
        if (lines.length && lines.every((l) => bullet.test(l))) {
          const ordered = /^\s*\d/.test(lines[0])
          const List = ordered ? "ol" : "ul"
          return (
            <List
              key={b}
              className={ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}
            >
              {lines.map((l, i) => (
                <li key={i}>{inline(l.replace(bullet, ""), onNavigate)}</li>
              ))}
            </List>
          )
        }
        return (
          <p key={b}>
            {lines.map((l, i) => (
              <Fragment key={i}>
                {i > 0 ? <br /> : null}
                {inline(l, onNavigate)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g

function inline(text: string, onNavigate?: () => void): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const [, label, href, bold] = m
    if (bold) {
      out.push(<strong key={m.index}>{bold}</strong>)
    } else if (href.startsWith("/") && !href.startsWith("//")) {
      // Locale prefixes are added by the i18n Link
      out.push(
        <Link
          key={m.index}
          href={href.replace(/^\/vi(?=\/|$)/, "") || "/"}
          onClick={onNavigate}
          className="font-semibold underline underline-offset-2"
        >
          {label}
        </Link>,
      )
    } else if (/^https:\/\//.test(href)) {
      out.push(
        <a
          key={m.index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2"
        >
          {label}
        </a>,
      )
    } else {
      out.push(label)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
