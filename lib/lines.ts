/**
 * MTA subway line colors. Class names are spelled out so Tailwind can detect them;
 * `hex` is for places without CSS (generated images).
 */
export const LINES = {
  red: {
    hex: "#ee352e",
    bg: "bg-line-red",
    text: "text-line-red",
    fg: "text-white",
    border: "border-line-red",
  },
  orange: {
    hex: "#ff6319",
    bg: "bg-line-orange",
    text: "text-line-orange",
    fg: "text-[#1d1f21]",
    border: "border-line-orange",
  },
  blue: {
    hex: "#0039a6",
    bg: "bg-line-blue",
    text: "text-line-blue",
    fg: "text-white",
    border: "border-line-blue",
  },
  purple: {
    hex: "#b933ad",
    bg: "bg-line-purple",
    text: "text-line-purple",
    fg: "text-white",
    border: "border-line-purple",
  },
  yellow: {
    hex: "#fccc0a",
    bg: "bg-line-yellow",
    text: "text-line-yellow",
    fg: "text-[#1d1f21]",
    border: "border-line-yellow",
  },
  green: {
    hex: "#00933c",
    bg: "bg-line-green",
    text: "text-line-green",
    fg: "text-white",
    border: "border-line-green",
  },
  lime: {
    hex: "#6cbe45",
    bg: "bg-line-lime",
    text: "text-line-lime",
    fg: "text-[#1d1f21]",
    border: "border-line-lime",
  },
  brown: {
    hex: "#996633",
    bg: "bg-line-brown",
    text: "text-line-brown",
    fg: "text-white",
    border: "border-line-brown",
  },
  gray: {
    hex: "#a7a9ac",
    bg: "bg-line-gray",
    text: "text-line-gray",
    fg: "text-[#1d1f21]",
    border: "border-line-gray",
  },
} as const

export type LineColor = keyof typeof LINES
