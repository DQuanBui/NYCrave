import { LINES } from "@/lib/lines"
import { cn } from "@/lib/utils"

/**
 * A fragment of an imaginary subway map: octilinear routes in real MTA colors with
 * transfer stations. Drawn around the hero poster, which sits on top of it.
 */
const ROUTES = [
  // Parallel pair (26 units apart, also through the 45 degree bend)
  { color: LINES.red.hex, d: "M-60 120 H300 L420 240 V1100" },
  { color: LINES.orange.hex, d: "M-60 146 H289 L394 251 V1100" },
  { color: LINES.blue.hex, d: "M1060 300 H700 L560 440 V1100" },
  { color: LINES.purple.hex, d: "M1060 560 H930" },
  { color: LINES.yellow.hex, d: "M1060 820 H720 L620 920 V1100" },
  { color: LINES.green.hex, d: "M-60 860 H260 L360 760 V-60" },
]

const INK = "#1d1f21"

export function RouteArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none", className)}
    >
      <g fill="none" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
        {ROUTES.map((r) => (
          <path key={r.d} d={r.d} stroke={r.color} />
        ))}
      </g>
      <g fill="#fff" stroke={INK} strokeWidth="5">
        {/* Transfer station across the red/orange pair */}
        <rect x="26" y="104" width="28" height="58" rx="14" />
        <circle cx="950" cy="300" r="12" />
        {/* Terminal of the short purple stub */}
        <circle cx="930" cy="560" r="14" />
        <circle cx="950" cy="820" r="12" />
        <circle cx="50" cy="860" r="12" />
      </g>
    </svg>
  )
}
