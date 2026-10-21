import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { PHOTO_WIDTHS } from "./lib/photo-widths.mjs"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Browsers must always check for a new service worker
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ]
  },
  images: {
    // Photos are resized ahead of time (scripts/photo-variants.mjs) rather than
    // by the metered on-demand optimizer, which paused the free Vercel project
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    imageSizes: PHOTO_WIDTHS.slice(0, 2),
    deviceSizes: PHOTO_WIDTHS.slice(2),
  },
}

export default withNextIntl(nextConfig)
