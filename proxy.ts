import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  // Everything except API routes, Next internals, generated icons, social images
  // (their URLs already carry the locale) and files with an extension
  matcher: "/((?!api|_next|_vercel|icon|apple-icon|.*opengraph-image|.*\\..*).*)",
}
