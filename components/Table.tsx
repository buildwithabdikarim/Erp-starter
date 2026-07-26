'use client'

import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  Column as TanstackColumn,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { TableConfig } from '@/types'
import { Button } from './Button'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react'
import { DEFAULT_PAGE_SIZE, MESSAGES } from '@/constants'

interface TableProps {
  config: TableConfig
  onRowClick?: (row: any) => void
}

export const Table: React.FC<TableProps> = ({
  config,
  onRowClick: onRowClickProp,
}) => {
  const [sorting, setSorting] = useState<any[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: config.pageSize || DEFAULT_PAGE_SIZE,
  })

  const enableSorting = config.enableSorting !== false
  const enableFiltering = !!config.enableFiltering
  const enablePagination = config.enablePagination !== false
  const hasActions = Boolean(config.actions?.length)

  const columnHelper = createColumnHelper<any>()

  const columns = useMemo(
    () =>
      config.columns.map((col) =>
        columnHelper.accessor(col.accessor || col.id, {
          id: col.id,
          header: col.header,
          enableSorting: enableSorting && col.sortable !== false,
          enableGlobalFilter: enableFiltering && col.filterable !== false,
          cell: (info) => {
            if (col.cell) {
              const cellContent = col.cell(info.getValue(), info.row.original)
              return typeof cellContent === 'string' || typeof cellContent === 'number' ? (
                <span>{cellContent}</span>
              ) : (
                cellContent
              )
            }
            return <span>{String(info.getValue() ?? '')}</span>
          },
          size: col.width,
        })
      ),
    [config.columns, columnHelper, enableSorting, enableFiltering]
  )

  const table = useReactTable({
    data: config.data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
  })

  const { rows } = table.getRowModel()

  const SortIcon = ({ column }: { column: TanstackColumn<any, unknown> }) => {
    const isSorted = column.getIsSorted()

    if (!enableSorting || !column.getCanSort()) return null

    if (isSorted === 'asc') {
      return <ChevronUp className="w-4 h-4" />
    }
    if (isSorted === 'desc') {
      return <ChevronDown className="w-4 h-4" />
    }

    return <ChevronsUpDown className="w-4 h-4 opacity-50" />
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {enableFiltering && (
        <div className="p-3 border-b border-border bg-muted/30">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              placeholder={config.filterPlaceholder || 'Search…'}
              className={cn(
                'w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              aria-label="Filter table"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-sm font-semibold text-foreground"
                    style={header.column.getSize() ? { width: header.column.getSize() } : undefined}
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon column={header.column} />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
                {hasActions && (
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                )}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={config.columns.length + (hasActions ? 1 : 0)}
                  className="px-6 py-10 text-center text-sm text-muted-foreground"
                >
                  {globalFilter ? MESSAGES.empty.noResults : MESSAGES.empty.noData}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'hover:bg-muted/50 transition-colors',
                    onRowClickProp || config.onRowClick ? 'cursor-pointer' : ''
                  )}
                  onClick={() => {
                    onRowClickProp?.(row.original)
                    config.onRowClick?.(row.original)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {config.actions!
                          .filter((action) => action.visible?.(row.original) !== false)
                          .map((action, idx) => (
                            <Button
                              key={`${action.label}-${idx}`}
                              variant={action.variant || 'secondary'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(row.original)
                              }}
                            >
                              {action.icon}
                              {action.label ? <span>{action.label}</span> : null}
                            </Button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {table.getPageCount() === 0
              ? 'Page 0 of 0'
              : `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

Table.displayName = 'Table'
