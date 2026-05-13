import { useForm } from 'react-hook-form'
import type { Book } from '#/lib/types'

export interface BookFormValues {
  title: string
  author: string
  isbn: string
}

interface BookFormProps {
  initial?: Book
  submitting?: boolean
  submitLabel?: string
  errorMessage?: string | null
  onSubmit: (values: BookFormValues) => void | Promise<void>
  onCancel?: () => void
}

export function BookForm({
  initial,
  submitting = false,
  submitLabel = 'Save',
  errorMessage,
  onSubmit,
  onCancel,
}: BookFormProps) {
  const { register, handleSubmit, formState } = useForm<BookFormValues>({
    defaultValues: {
      title: initial?.title ?? '',
      author: initial?.author ?? '',
      isbn: initial?.isbn ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-3">
      <Field label="Title" error={formState.errors.title?.message}>
        <input
          {...register('title', { required: 'Title is required' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </Field>
      <Field label="Author" error={formState.errors.author?.message}>
        <input
          {...register('author', { required: 'Author is required' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </Field>
      <Field label="ISBN" error={formState.errors.isbn?.message}>
        <input
          {...register('isbn', { required: 'ISBN is required' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </Field>

      {errorMessage && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMessage}</p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
