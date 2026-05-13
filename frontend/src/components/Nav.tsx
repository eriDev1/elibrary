import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { LibraryBig, LogOut } from 'lucide-react'
import { signOut } from '#/lib/auth'
import { useSessionQuery } from '#/lib/sessionQuery'
import { queryKeys } from '#/lib/queryKeys'

export function Nav() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session, role } = useSessionQuery()

  async function handleSignOut() {
    await signOut()
    await queryClient.invalidateQueries({ queryKey: queryKeys.session })
    navigate({ to: '/login' })
  }

  if (!session || !role) return null

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
            <LibraryBig size={22} />
            eLibrary
          </div>
          <div className="flex items-center gap-1">
            <NavLink to="/books" label="Books" />
            {role === 'staff' && <NavLink to="/members" label="Members" />}
            {role === 'staff' && <NavLink to="/borrows" label="Borrows" />}
            {role === 'member' && <NavLink to="/borrow" label="Borrow" />}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:block">{session.user.email}</span>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
              role === 'staff'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {role}
          </span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, label }: { to: '/books' | '/members' | '/borrows' | '/borrow'; label: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: 'text-indigo-600 font-medium' }}
      className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100"
    >
      {label}
    </Link>
  )
}
