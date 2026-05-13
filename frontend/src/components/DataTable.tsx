import { useEffect, useMemo, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type DataTableDensity = 'default' | 'compact'

const defaultPageSizes = [10, 25, 50]
const virtualRowThreshold = 15

export interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  getRowId: (row: TData) => string
  isPending?: boolean
  emptyMessage: string
  onRowClick?: (row: TData) => void
  resetPageKey?: string | number
  pageSize?: number
  pageSizeOptions?: number[]
  estimatedRowHeight?: number
  maxBodyHeight?: string
  density?: DataTableDensity
  embedded?: boolean
  rowCount?: number
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
}

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  isPending = false,
  emptyMessage,
  onRowClick,
  resetPageKey,
  pageSize: initialPageSize = 10,
  pageSizeOptions = defaultPageSizes,
  estimatedRowHeight = 52,
  maxBodyHeight = 'min(55vh, 480px)',
  density = 'default',
  embedded = false,
  rowCount: rowCountProp,
  pagination: paginationProp,
  onPaginationChange: onPaginationChangeProp,
}: DataTableProps<TData>) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const isServer =
    typeof rowCountProp === 'number' &&
    paginationProp !== undefined &&
    onPaginationChangeProp !== undefined

  const pagination = isServer ? paginationProp! : internalPagination
  const setPagination = isServer ? onPaginationChangeProp! : setInternalPagination

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [resetPageKey, setPagination])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [pagination.pageIndex])

  const effectiveRowCount = isServer ? rowCountProp! : data.length

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    ...(isServer
      ? {
          manualPagination: true,
          rowCount: rowCountProp,
          pageCount: Math.max(1, Math.ceil(rowCountProp! / pagination.pageSize)),
        }
      : { getPaginationRowModel: getPaginationRowModel() }),
    getRowId: (row) => getRowId(row),
  })

  const rows = table.getRowModel().rows
  const { pageIndex, pageSize } = table.getState().pagination
  const colCount = table.getVisibleLeafColumns().length

  const sizeOptions = useMemo(
    () => [...new Set([...pageSizeOptions, pageSize])].sort((a, b) => a - b),
    [pageSizeOptions, pageSize]
  )

  const shouldVirtualize =
    !isPending && effectiveRowCount > 0 && rows.length > virtualRowThreshold

  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 8,
  })

  const virtualItems = shouldVirtualize ? rowVirtualizer.getVirtualItems() : []
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0
  const paddingBottom =
    virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0

  const thPad = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3'
  const tdPad = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3'
  const thClass = `${thPad} text-left font-medium text-gray-500 text-xs uppercase tracking-wide`
  const tdClass = `${tdPad} align-middle`

  const fromIdx = effectiveRowCount === 0 ? 0 : pageIndex * pageSize + 1
  const toIdx = effectiveRowCount === 0 ? 0 : pageIndex * pageSize + rows.length

  const showFooter = isServer || (!isPending && data.length > 0)

  return (
    <div
      className={
        embedded
          ? 'border border-gray-200 rounded-lg overflow-hidden flex flex-col'
          : 'bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col'
      }
    >
      <div
        ref={scrollRef}
        className="overflow-auto min-h-[120px]"
        style={{ maxHeight: maxBodyHeight }}
      >
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-[1] bg-gray-50 shadow-[0_1px_0_0_rgb(229_231_235)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={thClass}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-900">
            {isPending ? (
              <tr>
                <td colSpan={colCount} className={`${tdPad} py-10 text-center text-gray-400`}>
                  Loading…
                </td>
              </tr>
            ) : effectiveRowCount === 0 ? (
              <tr>
                <td colSpan={colCount} className={`${tdPad} py-10 text-center text-gray-400`}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              <>
                {shouldVirtualize && virtualItems.length > 0 ? (
                  <>
                    {paddingTop > 0 && (
                      <tr className="pointer-events-none border-0" aria-hidden>
                        <td
                          colSpan={colCount}
                          style={{ height: paddingTop }}
                          className="p-0 border-0"
                        />
                      </tr>
                    )}
                    {virtualItems.map((virtualRow) => {
                      const row = rows[virtualRow.index]
                      return (
                        <tr
                          key={row.id}
                          className={`border-gray-100 ${
                            onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => onRowClick?.(row.original)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className={tdClass}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                    {paddingBottom > 0 && (
                      <tr className="pointer-events-none border-0" aria-hidden>
                        <td
                          colSpan={colCount}
                          style={{ height: paddingBottom }}
                          className="p-0 border-0"
                        />
                      </tr>
                    )}
                  </>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-gray-100 ${
                        onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className={tdClass}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {showFooter && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/90 text-xs text-gray-600 shrink-0 ${
            isPending ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <span>
            {fromIdx}–{toIdx} of {effectiveRowCount}
          </span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-gray-500">Rows</span>
              <select
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-800"
                value={pageSize}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  table.setPageSize(next)
                  table.setPageIndex(0)
                }}
              >
                {sizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="tabular-nums px-1 min-w-[4.5rem] text-center">
                {pageIndex + 1} / {table.getPageCount() || 1}
              </span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
