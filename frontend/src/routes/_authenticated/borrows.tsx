import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { api } from '#/lib/api'
import { getRole, getSession } from '#/lib/auth'
import { queryKeys } from '#/lib/queryKeys'
import type { BorrowReportItem } from '#/lib/types'
import type { PaginatedResponse } from '#/types/api'
import { DataTable } from '#/components/DataTable'

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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const reportQuery = useQuery({
    queryKey: queryKeys.borrows(pagination.pageIndex, pagination.pageSize),
    queryFn: () => {
      const p = new URLSearchParams()
      p.set('page', String(pagination.pageIndex + 1))
      p.set('page_size', String(pagination.pageSize))
      return api.get<PaginatedResponse<BorrowReportItem>>(`/borrows?${p.toString()}`)
    },
  })

  const list = reportQuery.data
  const items = list?.items ?? []
  const total = list?.total ?? 0

  const columns = useMemo<ColumnDef<BorrowReportItem>[]>(
    () => [
      {
        id: 'member',
        header: 'Member',
        cell: ({ row }) => (
          <>
            <div className="font-medium text-gray-900">{row.original.member_name}</div>
            <div className="text-xs text-gray-500">{row.original.member_email}</div>
          </>
        ),
      },
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
        accessorKey: 'borrow_date',
        header: 'Borrowed',
        cell: ({ getValue }) => (
          <span className="text-gray-600">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'due_date',
        header: 'Due',
        cell: ({ getValue }) => (
          <span className="text-gray-600">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <BorrowStatus row={row.original} />,
      },
    ],
    []
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="text-indigo-600" size={22} />
        <h1 className="text-2xl font-bold text-gray-900">Borrow report</h1>
        <span className="text-sm text-gray-400 ml-1">({total})</span>
      </div>

      {reportQuery.error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {reportQuery.error.message}
        </div>
      )}

      <DataTable<BorrowReportItem>
        data={items}
        columns={columns}
        getRowId={(r) => r.id}
        isPending={reportQuery.isPending}
        emptyMessage="No borrow records yet"
        rowCount={total}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
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
