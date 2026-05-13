import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { api } from '#/lib/api'
import { getRole, getSession } from '#/lib/auth'
import { useSessionQuery } from '#/lib/sessionQuery'
import { queryKeys } from '#/lib/queryKeys'
import type { Book, BorrowRecord, MemberActiveBorrow } from '#/lib/types'
import type { PaginatedResponse } from '#/types/api'
import { DataTable } from '#/components/DataTable'

export const Route = createFileRoute('/_authenticated/borrow')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
    if (getRole(session) !== 'member') throw redirect({ to: '/books' })
  },
  component: BorrowPage,
})

function BorrowPage() {
  const queryClient = useQueryClient()
  const { session } = useSessionQuery()
  const memberId = session?.user.id ?? null

  const [success, setSuccess] = useState<string | null>(null)
  const [bookPagination, setBookPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [loanPagination, setLoanPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const booksQuery = useQuery({
    queryKey: [
      'books',
      'available',
      bookPagination.pageIndex,
      bookPagination.pageSize,
    ] as const,
    queryFn: () => {
      const p = new URLSearchParams()
      p.set('page', String(bookPagination.pageIndex + 1))
      p.set('page_size', String(bookPagination.pageSize))
      p.set('available_only', '1')
      return api.get<PaginatedResponse<Book>>(`/books?${p.toString()}`)
    },
    enabled: memberId !== null,
  })

  const myBorrowsQuery = useQuery({
    queryKey: memberId
      ? queryKeys.myBorrows(memberId, loanPagination.pageIndex, loanPagination.pageSize)
      : ['myBorrows', 'pending'],
    queryFn: () => {
      const p = new URLSearchParams()
      p.set('page', String(loanPagination.pageIndex + 1))
      p.set('page_size', String(loanPagination.pageSize))
      return api.get<PaginatedResponse<MemberActiveBorrow>>(`/borrow/my?${p.toString()}`)
    },
    enabled: memberId !== null,
  })

  function invalidateBorrowData() {
    queryClient.invalidateQueries({ queryKey: ['books'] })
    if (memberId) {
      queryClient.invalidateQueries({ queryKey: ['myBorrows', memberId] })
      queryClient.invalidateQueries({ queryKey: ['myBorrowHistory', memberId] })
    }
  }

  const borrowMutation = useMutation({
    mutationFn: (bookId: string) => api.post<BorrowRecord>('/borrow', { bookId }),
    onSuccess: (record) => {
      invalidateBorrowData()
      setSuccess(
        `Borrowed on ${new Date(record.borrow_date).toLocaleDateString()}. Return by ${new Date(record.due_date).toLocaleDateString()}.`
      )
    },
  })

  const returnMutation = useMutation({
    mutationFn: (bookId: string) => api.post('/return', { bookId }),
    onSuccess: () => {
      invalidateBorrowData()
      setSuccess('Book returned successfully.')
    },
  })

  const bookList = booksQuery.data
  const availableRows = bookList?.items ?? []
  const availableTotal = bookList?.total ?? 0

  const loanList = myBorrowsQuery.data
  const myLoans = loanList?.items ?? []
  const loansTotal = loanList?.total ?? 0

  const availableColumns = useMemo<ColumnDef<Book>[]>(() => {
    const borrowingId =
      borrowMutation.isPending && borrowMutation.variables
        ? borrowMutation.variables
        : null
    return [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'author',
        header: 'Author',
        cell: ({ getValue }) => <span className="text-gray-600">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'isbn',
        header: 'ISBN',
        cell: ({ getValue }) => (
          <span className="text-gray-500 font-mono text-xs">{getValue<string>()}</span>
        ),
      },
      {
        id: 'borrow',
        header: () => null,
        cell: ({ row }) => (
          <div className="text-right">
            <button
              type="button"
              onClick={() => {
                setSuccess(null)
                borrowMutation.mutate(row.original.id)
              }}
              disabled={borrowingId === row.original.id}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              {borrowingId === row.original.id ? 'Borrowing…' : 'Borrow'}
            </button>
          </div>
        ),
      },
    ]
  }, [borrowMutation.isPending, borrowMutation.variables])

  const loanColumns = useMemo<ColumnDef<MemberActiveBorrow>[]>(() => {
    const returningId =
      returnMutation.isPending && returnMutation.variables ? returnMutation.variables : null
    return [
      {
        id: 'title',
        header: 'Title',
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
        header: 'Return by',
        cell: ({ getValue }) => (
          <span className="text-gray-600 font-medium">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <DueBadge dueDate={row.original.due_date} />,
      },
      {
        id: 'return',
        header: () => null,
        cell: ({ row }) => (
          <div className="text-right">
            <button
              type="button"
              onClick={() => {
                setSuccess(null)
                returnMutation.mutate(row.original.book_id)
              }}
              disabled={returningId === row.original.book_id}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              {returningId === row.original.book_id ? 'Returning…' : 'Return'}
            </button>
          </div>
        ),
      },
    ]
  }, [returnMutation.isPending, returnMutation.variables])

  const error =
    booksQuery.error?.message ??
    myBorrowsQuery.error?.message ??
    borrowMutation.error?.message ??
    returnMutation.error?.message ??
    null

  if (!memberId) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Borrow &amp; Return</h1>
      <p className="text-sm text-gray-500 -mt-4">
        Loan length follows your member type (strategy): standard 14 days, student 21, premium 30.
      </p>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">{success}</div>
      )}

      <section>
        <div className="flex items-center gap-2 mb-3">
          <ArrowDownToLine className="text-indigo-600" size={18} />
          <h2 className="text-base font-semibold text-gray-800">
            Available books ({availableTotal})
          </h2>
        </div>
        <DataTable<Book>
          data={availableRows}
          columns={availableColumns}
          getRowId={(b) => b.id}
          isPending={booksQuery.isPending}
          emptyMessage="No available books"
          rowCount={availableTotal}
          pagination={bookPagination}
          onPaginationChange={setBookPagination}
        />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpFromLine className="text-amber-500" size={18} />
          <h2 className="text-base font-semibold text-gray-800">
            My current loans ({loansTotal})
          </h2>
        </div>
        <DataTable<MemberActiveBorrow>
          data={myLoans}
          columns={loanColumns}
          getRowId={(l) => l.id}
          isPending={myBorrowsQuery.isPending}
          emptyMessage="You have no active loans"
          rowCount={loansTotal}
          pagination={loanPagination}
          onPaginationChange={setLoanPagination}
        />
      </section>
    </div>
  )
}

function DueBadge({ dueDate }: { dueDate: string }) {
  const due = new Date(dueDate).getTime()
  const now = Date.now()
  if (due < now) {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Overdue
      </span>
    )
  }
  const days = Math.ceil((due - now) / (24 * 60 * 60 * 1000))
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
      {days} day{days === 1 ? '' : 's'} left
    </span>
  )
}
