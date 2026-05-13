import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '#/lib/api'
import { getSession, getRole } from '#/lib/auth'
import { queryKeys } from '#/lib/queryKeys'
import { BookOpen, Plus } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  is_available: boolean
}

export const Route = createFileRoute('/_authenticated/books')({
  component: BooksPage,
})

function BooksPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', author: '', isbn: '' })

  const booksQuery = useQuery({
    queryKey: queryKeys.books,
    queryFn: () => api.get<Book[]>('/books'),
  })

  const roleQuery = useQuery({
    queryKey: ['auth', 'role'] as const,
    queryFn: async () => {
      const s = await getSession()
      return getRole(s)
    },
    staleTime: 5 * 60 * 1000,
  })

  const addBook = useMutation({
    mutationFn: () => api.post<Book>('/books', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books })
      setForm({ title: '', author: '', isbn: '' })
      setShowForm(false)
    },
  })

  async function handleAddBook(e: React.FormEvent) {
    e.preventDefault()
    addBook.mutate()
  }

  const books = booksQuery.data ?? []
  const role = roleQuery.data ?? null
  const error =
    booksQuery.error?.message ?? addBook.error?.message ?? null

  if (booksQuery.isPending) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading books…
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="text-indigo-600" size={22} />
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <span className="text-sm text-gray-400 ml-1">({books.length})</span>
        </div>
        {role === 'staff' && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add book
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {showForm && role === 'staff' && (
        <form
          onSubmit={handleAddBook}
          className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3"
        >
          <h2 className="text-sm font-semibold text-gray-700">New book</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              placeholder="Author"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              placeholder="ISBN"
              value={form.isbn}
              onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={addBook.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {addBook.isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">ISBN</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {books.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No books yet
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{book.title}</td>
                  <td className="px-4 py-3 text-gray-600">{book.author}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{book.isbn}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        book.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {book.is_available ? 'Available' : 'Borrowed'}
                    </span>
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
