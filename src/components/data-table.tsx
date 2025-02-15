'use client'

import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type TableOptions,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { Table as TableType } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  tableRef?: TableType<TData>
  showPagination?: boolean
  showLoading?: boolean
  isLoading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tableRef,
  showPagination = false,
  showLoading = false,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table =
    tableRef ??
    useReactTable({
      data,
      columns,
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      state: {
        sorting,
      },
    })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem dados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <span>
          {showLoading && isLoading ? (
            <Loader2 className="animate-spin" />
          ) : null}
        </span>
        {showPagination && (
          <span>
            Página <strong>{table.getState().pagination.pageIndex + 1}</strong>{' '}
            de {table.getPageCount().toLocaleString()}
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}
