import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { History } from 'lucide-react'
import { api } from '#/lib/api'
import { getRole, getSession } from '#/lib/auth'
import { useSessionQuery } from '#/lib/sessionQuery'
import { queryKeys } from '#/lib/queryKeys'
import type { MemberBorrowHistoryEntry } from '#/lib/types'
import type { PaginatedResponse } from '#/types/api'
import { DataTable } from '#/components/DataTable'

export const Route = createFileRoute('/_authenticated/my-history')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
    if (getRole(session) !== 'member') throw redirect({ to: '/books' })
  },
  component: MyHistoryPage,
})

function MyHistoryPage() {
  const { session } = useSessionQuery()
  const memberId = session?.user.id ?? null
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const historyQuery = useQuery({
    queryKey: memberId
      ? queryKeys.myBorrowHistory(memberId, pagination.pageIndex, pagination.pageSize)
      : ['myBorrowHistory', 'idle'],
    queryFn: () => {
      const p = new URLSearchParams()
      p.set('page', String(pagination.pageIndex + 1))
      p.set('page_size', String(pagination.pageSize))
      return api.get<PaginatedResponse<MemberBorrowHistoryEntry>>(
        `/borrow/history?${p.toString()}`
      )
    },
    enabled: memberId !== null,
  })

  const list = historyQuery.data
  const rows = list?.items ?? []
  const total = list?.total ?? 0

  const columns = useMemo<ColumnDef<MemberBorrowHistoryEntry>[]>(
    () => [
      {
        id: 'book',
        header: 'Book',
        cell: ({ row }) => (
          <>
            <div className="font-medium text-gray-900">{row.original.book_title}</div>
            <div className="text-xs text-gray-500">{row.original.book_author}</div>
          </>
        ),
      },
      {
        accessorKey: 'book_isbn',
        header: 'ISBN',
        cell: ({ getValue }) => (
          <span className="text-gray-500 font-mono text-xs">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'borrow_date',
        header: 'Borrowed',
        cell: ({ getValue }) => (
          <span className="text-gray-600 whitespace-nowrap">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'due_date',
        header: 'Due',
        cell: ({ getValue }) => (
          <span className="text-gray-600 whitespace-nowrap">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'return_date',
        header: 'Returned',
        cell: ({ getValue }) => {
          const v = getValue<string | null>()
          return (
            <span className="text-gray-600 whitespace-nowrap">
              {v ? new Date(v).toLocaleDateString() : '—'}
            </span>
          )
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) =>
          row.original.return_date === null ? (
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900">
              Active
            </span>
          ) : (
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Returned
            </span>
          ),
      },
    ],
    []
  )

  if (!memberId) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <History className="text-indigo-600" size={22} />
        <h1 className="text-2xl font-bold text-gray-900">My borrow history</h1>
        <span className="text-sm text-gray-400 ml-1">({total})</span>
      </div>

      {historyQuery.error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {historyQuery.error.message}
        </div>
      )}

      <DataTable<MemberBorrowHistoryEntry>
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        isPending={historyQuery.isPending}
        emptyMessage="You have no borrow records yet"
        rowCount={total}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  )
}
