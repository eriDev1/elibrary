import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { api } from '#/lib/api'
import { queryKeys } from '#/lib/queryKeys'
import { useSessionQuery } from '#/lib/sessionQuery'
import type { Book } from '#/lib/types'
import { Modal } from '#/components/Modal'
import { ConfirmDialog } from '#/components/ConfirmDialog'
import { BookForm, type BookFormValues } from '#/components/BookForm'

export const Route = createFileRoute('/_authenticated/books')({
  component: BooksPage,
})

function BooksPage() {
  const { role } = useSessionQuery()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState<Book | null>(null)

  const booksQuery = useQuery({
    queryKey: queryKeys.books(search),
    queryFn: () => api.get<Book[]>(`/books?search=${encodeURIComponent(search)}`),
  })

  function invalidateBooks() {
    queryClient.invalidateQueries({ queryKey: ['books'] })
  }

  const createMutation = useMutation({
    mutationFn: (values: BookFormValues) => api.post<Book>('/books', values),
    onSuccess: () => {
      invalidateBooks()
      setCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: BookFormValues & { id: string }) =>
      api.put<Book>(`/books/${values.id}`, {
        title: values.title,
        author: values.author,
        isbn: values.isbn,
      }),
    onSuccess: () => {
      invalidateBooks()
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<void>(`/books/${id}`),
    onSuccess: () => {
      invalidateBooks()
      setDeleting(null)
    },
  })

  const books = booksQuery.data ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-indigo-600" size={22} />
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <span className="text-sm text-gray-400 ml-1">({books.length})</span>
        </div>
        {role === 'staff' && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <Plus size={16} />
            Add book
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author or ISBN…"
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {booksQuery.error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {booksQuery.error.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">ISBN</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Added</th>
              {role === 'staff' && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {booksQuery.isPending ? (
              <tr>
                <td colSpan={role === 'staff' ? 6 : 5} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={role === 'staff' ? 6 : 5} className="px-4 py-8 text-center text-gray-400">
                  No books match your search
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{book.title}</td>
                  <td className="px-4 py-3 text-gray-600">{book.author}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{book.isbn}</td>
                  <td className="px-4 py-3">
                    <StatusBadge available={book.is_available} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(book.created_at).toLocaleDateString()}
                  </td>
                  {role === 'staff' && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditing(book)}
                        className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 mr-1"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleting(book)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New book">
        <BookForm
          submitting={createMutation.isPending}
          errorMessage={createMutation.error?.message ?? null}
          onCancel={() => setCreateOpen(false)}
          onSubmit={(values) => createMutation.mutate(values)}
        />
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit book">
        {editing && (
          <BookForm
            initial={editing}
            submitting={updateMutation.isPending}
            errorMessage={updateMutation.error?.message ?? null}
            onCancel={() => setEditing(null)}
            onSubmit={(values) => updateMutation.mutate({ id: editing.id, ...values })}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete book"
        message={
          deleting
            ? `Delete "${deleting.title}"? This will also remove its borrow history.`
            : ''
        }
        loading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  )
}

function StatusBadge({ available }: { available: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        available ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {available ? 'Available' : 'Borrowed'}
    </span>
  )
}
