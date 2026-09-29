import { cn } from "@/lib/utils"

/**
 * Manhattanhenge, drawn: a cross street's canyon of towers with the sun setting
 * at the far end. The sun sinks slowly unless reduced motion is on.
 */
export function HengeArt({ className }: { className?: string }) {
  // Lit windows on the two facades, receding toward the vanishing point
  const rows = Array.from({ length: 7 }, (_, i) => i)
  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={cn("block", className)}
    >
      <defs>
        <linearGradient id="henge-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2350" />
          <stop offset="0.45" stopColor="#c2456a" />
          <stop offset="0.75" stopColor="#f5834a" />
          <stop offset="1" stopColor="#ffc15e" />
        </linearGradient>
        <radialGradient id="henge-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ffc15e" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="henge-street" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5a25a" />
          <stop offset="0.25" stopColor="#5b4a5a" />
          <stop offset="1" stopColor="#1d1f21" />
        </linearGradient>
        <clipPath id="henge-horizon">
          <rect x="0" y="0" width="400" height="176" />
        </clipPath>
      </defs>

      <rect width="400" height="260" fill="url(#henge-sky)" />
      <g clipPath="url(#henge-horizon)">
        <g className="motion-safe:animate-[henge-sink_9s_ease-in-out_infinite_alternate]">
          <circle cx="200" cy="168" r="70" fill="url(#henge-glow)" />
          <circle cx="200" cy="168" r="24" fill="#fff1c1" />
        </g>
      </g>

      {/* The street, glowing where the sun hits it */}
      <polygon points="178,176 222,176 400,260 0,260" fill="url(#henge-street)" />
      <polygon points="197,176 203,176 240,260 160,260" fill="#ffc15e" opacity="0.18" />

      {/* Left and right facades */}
      <polygon points="0,0 178,96 178,176 0,260" fill="#1d1f21" />
      <polygon points="400,0 222,96 222,176 400,260" fill="#26282b" />
      {rows.map((i) => {
        const t = i / rows.length
        const xL = 20 + t * 140
        const xR = 380 - t * 140
        const top = 40 + t * 50
        const bottom = 230 - t * 50
        const w = 10 - t * 7
        return (
          <g key={i} fill="#ffcf7a" opacity={0.55 - t * 0.35}>
            {[0, 1, 2, 3, 4].map((k) => {
              const y = top + ((bottom - top) * (k + 0.5)) / 5
              return (
                <g key={k}>
                  <rect x={xL} y={y} width={w} height={w * 0.8} rx="1" />
                  <rect x={xR - w} y={y} width={w} height={w * 0.8} rx="1" />
                </g>
              )
            })}
          </g>
        )
      })}
      {/* Rim light on the building edges facing the sun */}
      <line x1="178" y1="96" x2="178" y2="176" stroke="#ffb35c" strokeWidth="1.5" opacity="0.8" />
      <line x1="222" y1="96" x2="222" y2="176" stroke="#ffb35c" strokeWidth="1.5" opacity="0.8" />
    </svg>
  )
}
