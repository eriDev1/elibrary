import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { api } from '#/lib/api'
import { getRole, getSession } from '#/lib/auth'
import { queryKeys } from '#/lib/queryKeys'
import type { BorrowReportItem } from '#/lib/types'

export const Route = createFileRoute('/_authenticated/borrows')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
    if (getRole(session) !== 'staff') throw redirect({ to: '/books' })
  },
  component: BorrowsReportPage,
})

function BorrowsReportPage() {
  const reportQuery = useQuery({
    queryKey: queryKeys.borrows,
    queryFn: () => api.get<BorrowReportItem[]>('/borrows'),
  })

  const items = reportQuery.data ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="text-indigo-600" size={22} />
        <h1 className="text-2xl font-bold text-gray-900">Borrow report</h1>
        <span className="text-sm text-gray-400 ml-1">({items.length})</span>
      </div>

      {reportQuery.error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {reportQuery.error.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Member</th>
              <th className="px-4 py-3 text-left">Book</th>
              <th className="px-4 py-3 text-left">Borrowed</th>
              <th className="px-4 py-3 text-left">Due</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reportQuery.isPending ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No borrow records yet
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{row.member_name}</div>
                    <div className="text-xs text-gray-500">{row.member_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{row.book_title}</div>
                    <div className="text-xs text-gray-500">{row.book_author}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(row.borrow_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(row.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <BorrowStatus row={row} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BorrowStatus({ row }: { row: BorrowReportItem }) {
  if (row.return_date) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Returned {new Date(row.return_date).toLocaleDateString()}
      </span>
    )
  }
  const overdue = new Date(row.due_date).getTime() < Date.now()
  return overdue ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      Overdue
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
      Active
    </span>
  )
}
