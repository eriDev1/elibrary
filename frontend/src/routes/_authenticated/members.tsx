import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { api } from '#/lib/api'
import { getRole, getSession } from '#/lib/auth'
import { queryKeys } from '#/lib/queryKeys'
import type { Member, MemberBorrowHistoryEntry } from '#/lib/types'
import { Modal } from '#/components/Modal'
import { ConfirmDialog } from '#/components/ConfirmDialog'
import { MemberForm, type MemberFormValues } from '#/components/MemberForm'

export const Route = createFileRoute('/_authenticated/members')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
    if (getRole(session) !== 'staff') throw redirect({ to: '/books' })
  },
  component: MembersPage,
})

function MembersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState<Member | null>(null)
  const [historyMember, setHistoryMember] = useState<Member | null>(null)

  const membersQuery = useQuery({
    queryKey: queryKeys.members(search),
    queryFn: () => api.get<Member[]>(`/members?search=${encodeURIComponent(search)}`),
  })

  const historyQuery = useQuery({
    queryKey: historyMember
      ? queryKeys.memberBorrows(historyMember.id)
      : ['memberBorrows', 'idle'],
    queryFn: () =>
      api.get<MemberBorrowHistoryEntry[]>(`/members/${historyMember!.id}/borrows`),
    enabled: historyMember !== null,
  })

  function invalidateMembers() {
    queryClient.invalidateQueries({ queryKey: ['members'] })
  }

  const createMutation = useMutation({
    mutationFn: (values: MemberFormValues) => api.post<Member>('/members', values),
    onSuccess: () => {
      invalidateMembers()
      setCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: MemberFormValues & { id: string }) =>
      api.put<Member>(`/members/${values.id}`, {
        name: values.name,
        email: values.email,
        memberType: values.memberType,
      }),
    onSuccess: () => {
      invalidateMembers()
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<void>(`/members/${id}`),
    onSuccess: () => {
      invalidateMembers()
      setDeleting(null)
    },
  })

  const members = membersQuery.data ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-indigo-600" size={22} />
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <span className="text-sm text-gray-400 ml-1">({members.length})</span>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <Plus size={16} />
          Add member
        </button>
      </div>

      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {membersQuery.error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {membersQuery.error.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {membersQuery.isPending ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No members match your search
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setHistoryMember(m)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                  <td className="px-4 py-3 text-gray-600">{m.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                      {m.member_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td
                    className="px-4 py-3 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setEditing(m)}
                      className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 mr-1"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleting(m)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New member">
        <MemberForm
          submitting={createMutation.isPending}
          errorMessage={createMutation.error?.message ?? null}
          onCancel={() => setCreateOpen(false)}
          onSubmit={(values) => createMutation.mutate(values)}
        />
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit member">
        {editing && (
          <MemberForm
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
        title="Delete member"
        message={
          deleting
            ? `Delete "${deleting.name}"? This will also remove their borrow history.`
            : ''
        }
        loading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />

      <Modal
        wide
        open={historyMember !== null}
        onClose={() => setHistoryMember(null)}
        title={historyMember ? `Borrow history — ${historyMember.name}` : 'Borrow history'}
      >
        {historyMember && (
          <>
            {historyQuery.isPending && (
              <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
            )}
            {historyQuery.error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {historyQuery.error.message}
              </div>
            )}
            {!historyQuery.isPending && !historyQuery.error && (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-3 py-2 text-left">Book</th>
                      <th className="px-3 py-2 text-left">ISBN</th>
                      <th className="px-3 py-2 text-left">Borrowed</th>
                      <th className="px-3 py-2 text-left">Due</th>
                      <th className="px-3 py-2 text-left">Returned</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(historyQuery.data ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                          No borrows yet
                        </td>
                      </tr>
                    ) : (
                      (historyQuery.data ?? []).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div className="font-medium text-gray-900">{row.book_title}</div>
                            <div className="text-xs text-gray-500">{row.book_author}</div>
                          </td>
                          <td className="px-3 py-2 text-gray-500 font-mono text-xs">
                            {row.book_isbn}
                          </td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                            {new Date(row.borrow_date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                            {new Date(row.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                            {row.return_date
                              ? new Date(row.return_date).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="px-3 py-2">
                            {row.return_date === null ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                Returned
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
