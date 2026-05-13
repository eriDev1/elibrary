import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { api } from '#/lib/api'
import { getRole, getSession } from '#/lib/auth'
import { queryKeys } from '#/lib/queryKeys'
import type { Member, MemberBorrowHistoryEntry } from '#/lib/types'
import type { PaginatedResponse } from '#/types/api'
import { DataTable } from '#/components/DataTable'
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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState<Member | null>(null)
  const [historyMember, setHistoryMember] = useState<Member | null>(null)
  const [historyPagination, setHistoryPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [search])

  useEffect(() => {
    setHistoryPagination({ pageIndex: 0, pageSize: 10 })
  }, [historyMember?.id])

  const membersQuery = useQuery({
    queryKey: queryKeys.members(search, pagination.pageIndex, pagination.pageSize),
    queryFn: () => {
      const p = new URLSearchParams()
      p.set('page', String(pagination.pageIndex + 1))
      p.set('page_size', String(pagination.pageSize))
      if (search) p.set('search', search)
      return api.get<PaginatedResponse<Member>>(`/members?${p.toString()}`)
    },
  })

  const historyQuery = useQuery({
    queryKey: historyMember
      ? queryKeys.memberBorrows(
          historyMember.id,
          historyPagination.pageIndex,
          historyPagination.pageSize
        )
      : ['memberBorrows', 'idle'],
    queryFn: () => {
      const p = new URLSearchParams()
      p.set('page', String(historyPagination.pageIndex + 1))
      p.set('page_size', String(historyPagination.pageSize))
      return api.get<PaginatedResponse<MemberBorrowHistoryEntry>>(
        `/members/${historyMember!.id}/borrows?${p.toString()}`
      )
    },
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

  const memberList = membersQuery.data
  const memberRows = memberList?.items ?? []
  const memberTotal = memberList?.total ?? 0

  const historyList = historyQuery.data
  const historyRows = historyList?.items ?? []
  const historyTotal = historyList?.total ?? 0

  const memberColumns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ getValue }) => <span className="text-gray-600">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'member_type',
        header: 'Type',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Joined',
        cell: ({ getValue }) => (
          <span className="text-xs text-gray-500">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => (
          <div className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setEditing(row.original)}
              className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 mr-1"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => setDeleting(row.original)}
              className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const historyColumns = useMemo<ColumnDef<MemberBorrowHistoryEntry>[]>(
    () => [
      {
        id: 'book',
        header: 'Book',
        cell: ({ row }) => (
          <>
            <div className="font-medium text-gray-900">{row.original.book_title}</div>
            <div className="text-xs text-gray-500">{row.original.book_author}</div>
          </>
        ),
      },
      {
        accessorKey: 'book_isbn',
        header: 'ISBN',
        cell: ({ getValue }) => (
          <span className="text-gray-500 font-mono text-xs">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'borrow_date',
        header: 'Borrowed',
        cell: ({ getValue }) => (
          <span className="text-gray-600 whitespace-nowrap">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'due_date',
        header: 'Due',
        cell: ({ getValue }) => (
          <span className="text-gray-600 whitespace-nowrap">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'return_date',
        header: 'Returned',
        cell: ({ getValue }) => {
          const v = getValue<string | null>()
          return (
            <span className="text-gray-600 whitespace-nowrap">
              {v ? new Date(v).toLocaleDateString() : '—'}
            </span>
          )
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) =>
          row.original.return_date === null ? (
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900">
              Active
            </span>
          ) : (
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Returned
            </span>
          ),
      },
    ],
    []
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-indigo-600" size={22} />
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <span className="text-sm text-gray-400 ml-1">({memberTotal})</span>
        </div>
        <button
          type="button"
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

      <DataTable<Member>
        data={memberRows}
        columns={memberColumns}
        getRowId={(m) => m.id}
        isPending={membersQuery.isPending}
        emptyMessage="No members match your search"
        onRowClick={(m) => setHistoryMember(m)}
        resetPageKey={search}
        rowCount={memberTotal}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

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
            {historyQuery.error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-2">
                {historyQuery.error.message}
              </div>
            )}
            <DataTable<MemberBorrowHistoryEntry>
              embedded
              data={historyRows}
              columns={historyColumns}
              getRowId={(r) => r.id}
              isPending={historyQuery.isPending}
              emptyMessage="No borrows yet"
              resetPageKey={historyMember.id}
              density="compact"
              maxBodyHeight="min(45vh, 360px)"
              estimatedRowHeight={56}
              rowCount={historyTotal}
              pagination={historyPagination}
              onPaginationChange={setHistoryPagination}
            />
          </>
        )}
      </Modal>
    </div>
  )
}
