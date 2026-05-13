import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '#/lib/api'
import { getSession, getRole } from '#/lib/auth'
import { queryKeys } from '#/lib/queryKeys'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  is_available: boolean
}

interface BorrowRecord {
  id: string
  bookId: string
  memberId: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
}

export const Route = createFileRoute('/_authenticated/borrow')({
  component: BorrowPage,
})

function BorrowPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [memberId, setMemberId] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getSession().then((s) => {
      const r = getRole(s)
      if (r !== 'member') {
        navigate({ to: '/books' })
        return
      }
      setMemberId(s!.user.id)
    })
  }, [navigate])

  const booksQuery = useQuery({
    queryKey: queryKeys.books,
    queryFn: () => api.get<Book[]>('/books'),
    enabled: memberId !== null,
  })

  const borrow = useMutation({
    mutationFn: (bookId: string) =>
      api.post<BorrowRecord>('/borrow', { bookId, memberId: memberId! }),
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books })
      setSuccess(`Borrowed successfully. Due: ${new Date(record.dueDate).toLocaleDateString()}`)
    },
  })

  const returnBook = useMutation({
    mutationFn: (bookId: string) => api.post('/return', { bookId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books })
      setSuccess('Book returned successfully.')
    },
  })

  const books = booksQuery.data ?? []
  const error =
    booksQuery.error?.message ??
    borrow.error?.message ??
    returnBook.error?.message ??
    null

  if (!memberId || booksQuery.isPending) {
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

      <section>
        <div className="flex items-center gap-2 mb-3">
          <ArrowDownToLine className="text-indigo-600" size={18} />
          <h2 className="text-base font-semibold text-gray-800">
            Available books ({available.length})
          </h2>
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
              {available.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No available books
                  </td>
                </tr>
              ) : (
                available.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{book.title}</td>
                    <td className="px-4 py-3 text-gray-600">{book.author}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{book.isbn}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSuccess(null)
                          borrow.mutate(book.id)
                        }}
                        disabled={borrow.isPending && borrow.variables === book.id}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {borrow.isPending && borrow.variables === book.id
                          ? 'Borrowing…'
                          : 'Borrow'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpFromLine className="text-amber-500" size={18} />
          <h2 className="text-base font-semibold text-gray-800">
            Borrowed books ({borrowed.length})
          </h2>
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
              {borrowed.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No borrowed books
                  </td>
                </tr>
              ) : (
                borrowed.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{book.title}</td>
                    <td className="px-4 py-3 text-gray-600">{book.author}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{book.isbn}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSuccess(null)
                          returnBook.mutate(book.id)
                        }}
                        disabled={returnBook.isPending && returnBook.variables === book.id}
                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {returnBook.isPending && returnBook.variables === book.id
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
