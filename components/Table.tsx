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
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { DEFAULT_PAGE_SIZE } from '@/constants'

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

  const columnHelper = createColumnHelper<any>()

  const columns = useMemo(
    () =>
      config.columns.map((col) =>
        columnHelper.accessor(col.accessor || col.id, {
          id: col.id,
          header: col.header,
          cell: (info) => {
            if (col.cell) {
              const cellContent = col.cell(info.getValue(), info.row.original)
              // If it returns a React element, render it; otherwise wrap in span
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
    [config.columns, columnHelper]
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
    getSortedRowModel: config.enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: config.enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: config.enablePagination ? getPaginationRowModel() : undefined,
  })

  const { rows } = table.getRowModel()

  if (rows.length === 0) {
    return (
      <div className="border border-border rounded-lg p-8">
        <p className="text-center text-muted-foreground">No data available</p>
      </div>
    )
  }

  const SortIcon = ({ column }: { column: TanstackColumn<any, unknown> }) => {
    const isSorted = column.getIsSorted()

    if (!config.enableSorting) return null

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
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-sm font-semibold text-foreground"
                  >
                    {config.enableSorting && header.column.getCanSort() ? (
                      <button
                        onClick={() => header.column.toggleSorting()}
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
                {config.actions && <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
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
                {config.actions && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {config.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant={(action.variant as 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | undefined) || 'secondary'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            action.onClick(row.original)
                          }}
                        >
                          {action.icon && <span>{action.icon}</span>}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {config.enablePagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {`Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`}
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
