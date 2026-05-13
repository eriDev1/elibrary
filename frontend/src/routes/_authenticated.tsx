import { createFileRoute, Navigate, Outlet, redirect } from '@tanstack/react-router'
import { getSession } from '#/lib/auth'
import { useSessionQuery } from '#/lib/sessionQuery'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { isPending, session } = useSessionQuery()

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
