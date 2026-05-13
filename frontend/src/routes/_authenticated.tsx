import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getSession } from '#/lib/auth'
import type { Session } from '@supabase/supabase-js'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    getSession().then((s) => {
      setSession(s)
      if (!s) navigate({ to: '/login' })
    })
  }, [navigate])

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  if (!session) return null

  return <Outlet />
}
