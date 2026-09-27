import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { PlaceEditor } from "@/components/admin/admin-forms"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { isAdmin } from "@/lib/admin-auth"
import { googlePlacesConfigured } from "@/lib/google-places"
import { writeBackend } from "@/lib/place-store"
import { getPlaceById } from "@/lib/places"
import { WEEKDAYS, type Place } from "@/types/place"

export const metadata: Metadata = { title: "Edit place", robots: { index: false, follow: false } }

// Depends on env and the session cookie at request time
export const dynamic = "force-dynamic"

function newPlaceTemplate(): Place {
  const hours = Object.fromEntries(
    WEEKDAYS.map((d) => [d, [{ open: "10:00", close: "22:00" }]]),
  ) as Place["hours"]
  return {
    id: `r-${Date.now().toString(36)}`,
    slug: "new-place",
    name: "New place",
    category: "restaurant",
    cuisines: [],
    dishTypes: [],
    dietary: [],
    borough: "manhattan",
    neighborhood: "Midtown",
    address: "TODO: verify",
    lat: 40.7549,
    lng: -73.984,
    priceLevel: 2,
    isFree: false,
    hours,
    mustTry: [],
    editorialTake: "",
    vibeTags: [],
    photos: [],
    verified: false,
    verificationNotes: "TODO: verify every field.",
    updatedAt: new Date().toISOString(),
  }
}

export default async function EditPlacePage({ params }: PageProps<"/[locale]/admin/place/[id]">) {
  await initLocale(params)
  if (!(await isAdmin())) redirect("/admin")
  if (writeBackend() === "readonly") redirect("/admin")

  const { id } = await params
  const place = id === "new" ? newPlaceTemplate() : await getPlaceById(id)
  if (!place) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 lg:px-8">
      <Link href="/admin" className="text-sm font-semibold underline underline-offset-4">
        Back to all places
      </Link>
      <h1 className="font-display text-display-md">{id === "new" ? "Add a place" : place.name}</h1>
      <PlaceEditor
        initialJson={JSON.stringify(place, null, 2)}
        googleEnabled={googlePlacesConfigured}
      />
    </div>
  )
}
