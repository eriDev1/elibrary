import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { api } from '#/lib/api'
import { getRole, getSession } from '#/lib/auth'
import { useSessionQuery } from '#/lib/sessionQuery'
import { queryKeys } from '#/lib/queryKeys'
import type { Book, BorrowRecord, MemberActiveBorrow } from '#/lib/types'

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

  const booksQuery = useQuery({
    queryKey: queryKeys.books(''),
    queryFn: () => api.get<Book[]>('/books'),
  })

  const myBorrowsQuery = useQuery({
    queryKey: memberId ? queryKeys.myBorrows(memberId) : ['myBorrows', 'pending'],
    queryFn: () => api.get<MemberActiveBorrow[]>('/borrow/my'),
    enabled: memberId !== null,
  })

  function invalidateBorrowData() {
    queryClient.invalidateQueries({ queryKey: ['books'] })
    if (memberId) queryClient.invalidateQueries({ queryKey: queryKeys.myBorrows(memberId) })
  }

  const borrowMutation = useMutation({
    mutationFn: (bookId: string) =>
      api.post<BorrowRecord>('/borrow', { bookId, memberId }),
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

  const books = booksQuery.data ?? []
  const myLoans = myBorrowsQuery.data ?? []

  const error =
    booksQuery.error?.message ??
    myBorrowsQuery.error?.message ??
    borrowMutation.error?.message ??
    returnMutation.error?.message ??
    null

  if (booksQuery.isPending || myBorrowsQuery.isPending || !memberId) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  const available = books.filter((b) => b.is_available)

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

      <Section
        icon={<ArrowDownToLine className="text-indigo-600" size={18} />}
        title={`Available books (${available.length})`}
        emptyMessage="No available books"
        rows={available}
        action={(book) => (
          <button
            onClick={() => {
              setSuccess(null)
              borrowMutation.mutate(book.id)
            }}
            disabled={borrowMutation.isPending && borrowMutation.variables === book.id}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
          >
            {borrowMutation.isPending && borrowMutation.variables === book.id
              ? 'Borrowing…'
              : 'Borrow'}
          </button>
        )}
      />

      <section>
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpFromLine className="text-amber-500" size={18} />
          <h2 className="text-base font-semibold text-gray-800">
            My current loans ({myLoans.length})
          </h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Borrowed</th>
                <th className="px-4 py-3 text-left">Return by</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myLoans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    You have no active loans
                  </td>
                </tr>
              ) : (
                myLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{loan.book_title}</div>
                      <div className="text-xs text-gray-500">{loan.book_author}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(loan.borrow_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium">
                      {new Date(loan.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <DueBadge dueDate={loan.due_date} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSuccess(null)
                          returnMutation.mutate(loan.book_id)
                        }}
                        disabled={
                          returnMutation.isPending &&
                          returnMutation.variables === loan.book_id
                        }
                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                      >
                        {returnMutation.isPending && returnMutation.variables === loan.book_id
                          ? 'Returning…'
                          : 'Return'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  emptyMessage: string
  rows: Book[]
  action: (book: Book) => React.ReactNode
}

function Section({ icon, title, emptyMessage, rows, action }: SectionProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">ISBN</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{book.title}</td>
                  <td className="px-4 py-3 text-gray-600">{book.author}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{book.isbn}</td>
                  <td className="px-4 py-3 text-right">{action(book)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
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
