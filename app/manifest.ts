import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NYCrave: New York, by craving",
    short_name: "NYCrave",
    description:
      "Where to eat, sip, shop, explore and take photos in New York City, plus a day planner.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f5f0",
    theme_color: "#1d1f21",
    categories: ["travel", "food", "lifestyle"],
    icons: [
      { src: "/api/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/api/pwa-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/api/pwa-icon/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Design my day", url: "/my-day" },
      { name: "Saved", url: "/saved" },
      { name: "Eat", url: "/eat" },
    ],
  }
}
