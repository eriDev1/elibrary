import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getSession, getRole, signOut } from '#/lib/auth'
import { LibraryBig, LogOut } from 'lucide-react'

export function Nav() {
  const navigate = useNavigate()
  const [role, setRole] = useState<'staff' | 'member' | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    getSession().then((s) => {
      setRole(getRole(s))
      setEmail(s?.user.email ?? null)
    })
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate({ to: '/login' })
  }

  if (!role) return null

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
            <LibraryBig size={22} />
            eLibrary
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/books"
              activeProps={{ className: 'text-indigo-600 font-medium' }}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Books
            </Link>
            {role === 'staff' && (
              <Link
                to="/members"
                activeProps={{ className: 'text-indigo-600 font-medium' }}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Members
              </Link>
            )}
            {role === 'member' && (
              <Link
                to="/borrow"
                activeProps={{ className: 'text-indigo-600 font-medium' }}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Borrow
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {email && (
            <span className="text-xs text-gray-500 hidden sm:block">{email}</span>
          )}
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
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
