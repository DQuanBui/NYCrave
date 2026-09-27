import { iconResponse } from "@/lib/og"

/** PWA manifest icons: /api/pwa-icon/192, /api/pwa-icon/512 and /api/pwa-icon/maskable. */
export async function GET(_: Request, { params }: RouteContext<"/api/pwa-icon/[size]">) {
  const { size } = await params
  if (size === "maskable") return iconResponse(512, { maskable: true })
  const px = Number(size)
  if (px !== 192 && px !== 512) return new Response("Not found", { status: 404 })
  return iconResponse(px)
}
