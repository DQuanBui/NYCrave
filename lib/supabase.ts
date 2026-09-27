import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseConfigured = Boolean(url && anonKey)

let reader: SupabaseClient | undefined
let writer: SupabaseClient | undefined

/** Public, read-only client (row level security allows select only). */
export function supabaseReader(): SupabaseClient | null {
  if (!url || !anonKey) return null
  reader ??= createClient(url, anonKey, { auth: { persistSession: false } })
  return reader
}

/** Service-role client for admin writes. Server only: the key bypasses RLS. */
export function supabaseWriter(): SupabaseClient | null {
  if (!url || !serviceKey) return null
  writer ??= createClient(url, serviceKey, { auth: { persistSession: false } })
  return writer
}
