import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '#/lib/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') throw redirect({ to: '/login' })
    const session = await getSession()
    throw redirect({ to: session ? '/books' : '/login' })
  },
})
