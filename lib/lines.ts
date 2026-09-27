/** MTA subway line colors. Class names are spelled out so Tailwind can detect them. */
export const LINES = {
  red: { bg: "bg-line-red", text: "text-line-red", fg: "text-white", border: "border-line-red" },
  orange: {
    bg: "bg-line-orange",
    text: "text-line-orange",
    fg: "text-[#1d1f21]",
    border: "border-line-orange",
  },
  blue: {
    bg: "bg-line-blue",
    text: "text-line-blue",
    fg: "text-white",
    border: "border-line-blue",
  },
  purple: {
    bg: "bg-line-purple",
    text: "text-line-purple",
    fg: "text-white",
    border: "border-line-purple",
  },
  yellow: {
    bg: "bg-line-yellow",
    text: "text-line-yellow",
    fg: "text-[#1d1f21]",
    border: "border-line-yellow",
  },
  green: {
    bg: "bg-line-green",
    text: "text-line-green",
    fg: "text-white",
    border: "border-line-green",
  },
  lime: {
    bg: "bg-line-lime",
    text: "text-line-lime",
    fg: "text-[#1d1f21]",
    border: "border-line-lime",
  },
  brown: {
    bg: "bg-line-brown",
    text: "text-line-brown",
    fg: "text-white",
    border: "border-line-brown",
  },
  gray: {
    bg: "bg-line-gray",
    text: "text-line-gray",
    fg: "text-[#1d1f21]",
    border: "border-line-gray",
  },
} as const

export type LineColor = keyof typeof LINES
