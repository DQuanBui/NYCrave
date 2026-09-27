import { Anton, Be_Vietnam_Pro } from "next/font/google"

/**
 * Condensed poster face for headlines. Only the latin file is preloaded; the
 * latin-ext and Vietnamese files still load on demand for the planned vi locale.
 */
export const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
})

/**
 * Body text. Not preloaded: the browser then fetches only the unicode subsets a
 * page actually uses (usually just latin) instead of every weight x subset up front.
 */
export const body = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-body",
  display: "swap",
  preload: false,
})
