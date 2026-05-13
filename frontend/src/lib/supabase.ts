import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function readEnv(): { url: string; anonKey: string } {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()
  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env for the frontend. Create frontend/.env (not backend/.env) with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY — same URL and anon key as in your Supabase project settings. See frontend/.env.example.'
    )
  }
  return { url, anonKey }
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    const { url, anonKey } = readEnv()
    client = createClient(url, anonKey)
  }
  return client
}
