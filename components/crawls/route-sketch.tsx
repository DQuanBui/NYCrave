import { cn } from "@/lib/utils"

const W = 320
const H = 96
const PAD = 18
/** Closest two stop markers may sit, so neighbors a minute apart stay readable. */
const MIN_GAP = 24

/** Nudges markers that overlap away from each other, keeping them inside the box. */
function spreadApart(points: number[][]) {
  for (let round = 0; round < 40; round++) {
    let moved = false
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++) {
        const [a, b] = [points[i], points[j]]
        let dx = b[0] - a[0]
        let dy = b[1] - a[1]
        const d = Math.hypot(dx, dy)
        if (d >= MIN_GAP) continue
        // Same spot: separate them sideways, in visiting order
        if (d < 0.5) [dx, dy] = [1, 0]
        const push = (MIN_GAP - d) / 2 / (Math.hypot(dx, dy) || 1)
        a[0] -= dx * push
        a[1] -= dy * push
        b[0] += dx * push
        b[1] += dy * push
        moved = true
      }
    for (const p of points) {
      p[0] = Math.min(W - PAD, Math.max(PAD, p[0]))
      p[1] = Math.min(H - PAD, Math.max(PAD, p[1]))
    }
    if (!moved) break
  }
}

/**
 * A crawl drawn like a subway strip map: the stops at their real positions
 * relative to each other, joined by a thick line in the craving's color.
 * Decorative; the numbered list next to it carries the same information.
 */
export function RouteSketch({
  stops,
  color,
  className,
}: {
  stops: { lat: number; lng: number }[]
  color: string
  className?: string
}) {
  if (stops.length < 2) return null
  // East-west degrees are shorter than north-south ones at New York's latitude
  const k = Math.cos((stops[0].lat * Math.PI) / 180)
  const xs = stops.map((s) => s.lng * k)
  const ys = stops.map((s) => -s.lat)
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)]
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)]
  // One scale for both axes keeps the shape true; stops a block apart are not blown up to fill the box
  const span = Math.max(maxX - minX, ((maxY - minY) * (W - 2 * PAD)) / (H - 2 * PAD), 0.004)
  const scale = (W - 2 * PAD) / span
  const offX = (W - (maxX - minX) * scale) / 2
  const offY = (H - (maxY - minY) * scale) / 2
  const points = xs.map((x, i) => [offX + (x - minX) * scale, offY + (ys[i] - minY) * scale])
  spreadApart(points)
  const path = points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ")

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      className={cn("h-24 w-full rounded-2xl bg-muted/60", className)}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.85}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={9} fill="white" stroke="currentColor" strokeWidth={2.5} />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={700}
            fill="#1d1f21"
          >
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  )
}
