import { Link, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api'
import { getSession, signIn } from '#/lib/auth'
import { queryKeys } from '#/lib/queryKeys'
import type { MemberType } from '#/lib/types'

interface SignupForm {
  name: string
  email: string
  password: string
  memberType: MemberType
}

const MEMBER_TYPES: MemberType[] = ['standard', 'student', 'premium']

export const Route = createFileRoute('/signup')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return
    const session = await getSession()
    if (session) throw redirect({ to: '/books' })
  },
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState } = useForm<SignupForm>({
    defaultValues: { name: '', email: '', password: '', memberType: 'standard' },
  })

  const signupMutation = useMutation({
    mutationFn: async (values: SignupForm) => {
      await api.post('/auth/signup', values)
      await signIn(values.email, values.password)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.session })
      navigate({ to: '/books' })
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Join eLibrary as a member</p>

        <form
          onSubmit={handleSubmit((values) => signupMutation.mutate(values))}
          className="space-y-4"
        >
          <Field label="Full name" error={formState.errors.name?.message}>
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

          <Field label="Password" error={formState.errors.password?.message}>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' },
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Field>

          <Field label="Member type">
            <select
              {...register('memberType')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {MEMBER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </Field>

          {signupMutation.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {signupMutation.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg px-4 py-2 text-sm"
          >
            {signupMutation.isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
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
