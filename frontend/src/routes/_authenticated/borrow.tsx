import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { api } from '#/lib/api'
import { getRole, getSession } from '#/lib/auth'
import { useSessionQuery } from '#/lib/sessionQuery'
import { queryKeys } from '#/lib/queryKeys'
import type { Book, BorrowRecord } from '#/lib/types'

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

  function invalidateBooks() {
    queryClient.invalidateQueries({ queryKey: ['books'] })
  }

  const borrowMutation = useMutation({
    mutationFn: (bookId: string) =>
      api.post<BorrowRecord>('/borrow', { bookId, memberId }),
    onSuccess: (record) => {
      invalidateBooks()
      setSuccess(`Borrowed. Due: ${new Date(record.due_date).toLocaleDateString()}`)
    },
  })

  const returnMutation = useMutation({
    mutationFn: (bookId: string) => api.post('/return', { bookId }),
    onSuccess: () => {
      invalidateBooks()
      setSuccess('Book returned successfully.')
    },
  })

  const books = booksQuery.data ?? []
  const error =
    booksQuery.error?.message ??
    borrowMutation.error?.message ??
    returnMutation.error?.message ??
    null

  if (booksQuery.isPending || !memberId) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  const available = books.filter((b) => b.is_available)
  const borrowed = books.filter((b) => !b.is_available)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Borrow &amp; Return</h1>

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

      <Section
        icon={<ArrowUpFromLine className="text-amber-500" size={18} />}
        title={`Borrowed books (${borrowed.length})`}
        emptyMessage="No borrowed books"
        rows={borrowed}
        action={(book) => (
          <button
            onClick={() => {
              setSuccess(null)
              returnMutation.mutate(book.id)
            }}
            disabled={returnMutation.isPending && returnMutation.variables === book.id}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
          >
            {returnMutation.isPending && returnMutation.variables === book.id
              ? 'Returning…'
              : 'Return'}
          </button>
        )}
      />
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
