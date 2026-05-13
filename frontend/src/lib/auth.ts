import { getSupabase } from './supabase'

export async function getSession() {
  const { data } = await getSupabase().auth.getSession()
  return data.session
}

export function getRole(session: Awaited<ReturnType<typeof getSession>>): 'staff' | 'member' | null {
  if (!session) return null
  return (session.user.app_metadata?.role as 'staff' | 'member') ?? 'member'
}

export async function signIn(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data.session
}

export async function signOut() {
  await getSupabase().auth.signOut()
}
