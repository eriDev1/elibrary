import { useForm } from 'react-hook-form'
import type { Member, MemberType } from '#/lib/types'

export interface MemberFormValues {
  name: string
  email: string
  memberType: MemberType
}

interface MemberFormProps {
  initial?: Member
  submitting?: boolean
  submitLabel?: string
  errorMessage?: string | null
  onSubmit: (values: MemberFormValues) => void | Promise<void>
  onCancel?: () => void
}

const TYPES: MemberType[] = ['standard', 'student', 'premium']

export function MemberForm({
  initial,
  submitting = false,
  submitLabel = 'Save',
  errorMessage,
  onSubmit,
  onCancel,
}: MemberFormProps) {
  const { register, handleSubmit, formState } = useForm<MemberFormValues>({
    defaultValues: {
      name: initial?.name ?? '',
      email: initial?.email ?? '',
      memberType: initial?.member_type ?? 'standard',
    },
  })

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-3">
      <Field label="Name" error={formState.errors.name?.message}>
        <input
          {...register('name', { required: 'Name is required' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </Field>
      <Field label="Email" error={formState.errors.email?.message}>
        <input
          type="email"
          {...register('email', { required: 'Email is required' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </Field>
      <Field label="Type">
        <select
          {...register('memberType')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
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
