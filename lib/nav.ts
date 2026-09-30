import {
  CalendarHeart,
  Camera,
  ChefHat,
  Compass,
  CupSoda,
  Footprints,
  Heart,
  Lightbulb,
  Map as MapIcon,
  MapPinned,
  Route,
  Stamp,
  ShoppingBag,
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"
import type { LineColor } from "@/lib/lines"
import { CATEGORY_META } from "@/lib/taxonomy"

export type NavKey =
  | "eat"
  | "sip"
  | "explore"
  | "shop"
  | "photoSpots"
  | "parks"
  | "neighborhoods"
  | "map"
  | "tips"
  | "myDay"
  | "saved"
  | "seasons"
  | "passport"
  | "next"
  | "food"

export type NavItem = { key: NavKey; href: string; icon: LucideIcon; line?: LineColor }

const category = (c: keyof typeof CATEGORY_META) => ({
  href: CATEGORY_META[c].href,
  line: CATEGORY_META[c].line,
})

export const NAV: Record<NavKey, NavItem> = {
  eat: { key: "eat", icon: UtensilsCrossed, ...category("restaurant") },
  sip: { key: "sip", icon: CupSoda, ...category("drink") },
  explore: { key: "explore", icon: Compass, ...category("attraction") },
  shop: { key: "shop", icon: ShoppingBag, ...category("shopping") },
  photoSpots: { key: "photoSpots", icon: Camera, ...category("photo_spot") },
  parks: { key: "parks", icon: Trees, ...category("park_pier") },
  neighborhoods: { key: "neighborhoods", href: "/neighborhoods", icon: MapPinned },
  map: { key: "map", href: "/map", icon: MapIcon },
  tips: { key: "tips", href: "/tips", icon: Lightbulb },
  myDay: { key: "myDay", href: "/my-day", icon: Route },
  saved: { key: "saved", href: "/saved", icon: Heart },
  seasons: { key: "seasons", href: "/seasons", icon: CalendarHeart, line: "orange" },
  passport: { key: "passport", href: "/passport", icon: Stamp, line: "yellow" },
  next: { key: "next", href: "/next", icon: Footprints, line: "green" },
  food: { key: "food", href: "/food", icon: ChefHat, line: "red" },
}

/** Mobile bottom tabs. */
export const TAB_BAR: NavKey[] = ["eat", "sip", "explore", "myDay", "saved"]
/** Desktop header, left group. */
export const TOP_NAV: NavKey[] = ["eat", "sip", "explore", "shop", "photoSpots", "parks"]
/** Full menu (mobile sheet). */
export const MENU: NavKey[] = [
  ...TOP_NAV,
  "next",
  "food",
  "map",
  "neighborhoods",
  "seasons",
  "tips",
  "myDay",
  "saved",
  "passport",
]

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}
