import { Anton, Be_Vietnam_Pro } from "next/font/google"

/** Condensed poster face for headlines. Covers Vietnamese for the planned vi locale. */
export const display = Anton({
  weight: "400",
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-anton",
  display: "swap",
})

export const body = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-body",
  display: "swap",
})
