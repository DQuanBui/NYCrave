import type { Metadata } from "next"
import { LineBullet } from "@/components/brand/line-bullet"
import { LoginForm, SyncSeedButton } from "@/components/admin/admin-forms"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { adminEnabled, isAdmin } from "@/lib/admin-auth"
import { writeBackend } from "@/lib/place-store"
import { getPlaces } from "@/lib/places"
import { openReports, type Report } from "@/lib/report-store"
import { supabaseConfigured } from "@/lib/supabase"
import { CATEGORY_META } from "@/lib/taxonomy"
import { logoutAction, resolveReportAction, setVerifiedAction } from "./actions"

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } }

// Depends on env and the session cookie at request time
export const dynamic = "force-dynamic"

const REPORT_LABEL: Record<Report["kind"], string> = {
  closed: "Closed",
  hours: "Hours",
  location: "Location",
  photo: "Photo",
  other: "Other",
}

const BACKEND_LABEL = {
  supabase: "Supabase (live database)",
  json: "Local JSON files (development only)",
  readonly: "Read-only: set Supabase env vars to edit in production",
} as const

/** Internal tool for adding and verifying places. English only by design. */
export default async function AdminPage({ params }: PageProps<"/[locale]/admin">) {
  await initLocale(params)

  if (!adminEnabled()) {
    return (
      <Shell>
        <p>
          Admin is disabled. Set <code className="font-semibold">ADMIN_PASSWORD</code> in{" "}
          <code className="font-semibold">.env.local</code> to turn it on.
        </p>
      </Shell>
    )
  }
  if (!(await isAdmin())) {
    return (
      <Shell>
        <LoginForm />
      </Shell>
    )
  }

  const places = (await getPlaces({}, { sort: "name" })).sort(
    (a, b) => Number(a.verified) - Number(b.verified),
  )
  const unverified = places.filter((p) => !p.verified).length
  const backend = writeBackend()
  const reports = await openReports()
  const nameOf = new Map(places.map((p) => [p.id, p]))

  return (
    <Shell>
      <div className="flex flex-wrap items-center gap-3">
        <p className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
          Writes go to: {BACKEND_LABEL[backend]}
        </p>
        <p className="rounded-full bg-taxi px-3 py-1 text-sm font-semibold text-taxi-foreground">
          {unverified} of {places.length} unverified
        </p>
        <form action={logoutAction} className="ml-auto">
          <button type="submit" className="text-sm font-semibold underline underline-offset-4">
            Sign out
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        {backend !== "readonly" ? (
          <Link
            href="/admin/place/new"
            className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-bold text-background"
          >
            Add a place
          </Link>
        ) : null}
        {supabaseConfigured && backend === "supabase" ? <SyncSeedButton /> : null}
      </div>

      {reports.length ? (
        <section aria-labelledby="reports" className="space-y-3">
          <h2 id="reports" className="text-xl font-bold">
            Reports from visitors ({reports.length})
          </h2>
          <ul className="divide-y rounded-2xl border">
            {reports.map((r) => {
              const place = nameOf.get(r.placeId)
              return (
                <li key={r.id} className="flex flex-wrap items-start gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-semibold">
                      {place ? (
                        <Link
                          href={`/place/${place.slug}`}
                          className="underline underline-offset-4"
                        >
                          {place.name}
                        </Link>
                      ) : (
                        r.placeId
                      )}{" "}
                      <span className="rounded-full bg-taxi px-2 py-0.5 text-xs text-taxi-foreground">
                        {REPORT_LABEL[r.kind]}
                      </span>
                    </p>
                    {r.note ? <p className="text-muted-foreground">“{r.note}”</p> : null}
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString("en-US", {
                        timeZone: "America/New_York",
                      })}
                    </p>
                  </div>
                  {place ? (
                    <Link
                      href={`/admin/place/${place.id}`}
                      className="font-semibold underline underline-offset-4"
                    >
                      Edit place
                    </Link>
                  ) : null}
                  <form action={resolveReportAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="font-semibold underline underline-offset-4">
                      Mark resolved
                    </button>
                  </form>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <div className="relative overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th scope="col" className="px-4 py-3">
                Place
              </th>
              <th scope="col" className="px-4 py-3">
                Neighborhood
              </th>
              <th scope="col" className="px-4 py-3">
                Updated
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {places.map((p) => {
              const meta = CATEGORY_META[p.category]
              return (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-semibold">
                      <LineBullet line={meta.line} size="xs">
                        {meta.bullet}
                      </LineBullet>
                      {p.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.neighborhood}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {p.updatedAt.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    {backend === "readonly" ? (
                      p.verified ? (
                        "Verified"
                      ) : (
                        "Unverified"
                      )
                    ) : (
                      <form action={setVerifiedAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="verified" value={p.verified ? "0" : "1"} />
                        <button
                          type="submit"
                          disabled={!p.verified && Boolean(p.verificationNotes?.includes("TODO"))}
                          title={
                            !p.verified && p.verificationNotes?.includes("TODO")
                              ? "Resolve the TODO notes in the editor first"
                              : undefined
                          }
                          className="rounded-full border-2 px-3 py-1 text-xs font-bold disabled:opacity-50"
                        >
                          {p.verified ? "Verified: undo" : "Mark verified"}
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {backend !== "readonly" ? (
                      <Link
                        href={`/admin/place/${p.id}`}
                        className="font-semibold underline underline-offset-4"
                      >
                        Edit
                      </Link>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 lg:px-8">
      <h1 className="font-display text-display-lg">Places admin</h1>
      {children}
    </div>
  )
}
