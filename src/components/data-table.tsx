'use client'

import {
  type ColumnDef,
  type PaginationState,
  flexRender,
} from '@tanstack/react-table'
import type { Table as TableType } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'

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
  tableRef: TableType<TData>
  showPagination?: boolean
  pagination?: PaginationState
  showLoading?: boolean
  isLoading?: boolean
  pageCount?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tableRef,
  pagination,
  pageCount,
  showPagination = false,
  showLoading = false,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {tableRef.getHeaderGroups().map((headerGroup) => (
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
            {showLoading && isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="animate-spin h-10 w-10" />
                  </div>
                </TableCell>
              </TableRow>
            ) : tableRef.getRowModel().rows?.length ? (
              tableRef.getRowModel().rows.map((row) => (
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
        <div className="flex items-center space-x-2">
          {showPagination && pagination && (
            <Pagination>
              <PaginationContent>
                {tableRef?.getCanPreviousPage() && (
                  <>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => tableRef.previousPage()}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationLink
                        onClick={() =>
                          tableRef.setPageIndex(pagination.pageIndex - 1)
                        }
                      >
                        {pagination.pageIndex}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    {pagination.pageIndex + 1}
                  </PaginationLink>
                </PaginationItem>

                {tableRef?.getCanNextPage() && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() =>
                        tableRef.setPageIndex(pagination.pageIndex + 1)
                      }
                    >
                      {pagination.pageIndex + 2}
                    </PaginationLink>
                  </PaginationItem>
                )}
                {pageCount && (
                  <PaginationItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <PaginationEllipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Páginas</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Array.from({ length: pageCount }, (_, i) => i).map(
                          (page) => (
                            <DropdownMenuItem
                              key={page}
                              onClick={() => tableRef.setPageIndex(page)}
                            >
                              {page + 1}
                            </DropdownMenuItem>
                          ),
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </PaginationItem>
                )}

                {tableRef?.getCanNextPage() && (
                  <PaginationItem>
                    <PaginationNext onClick={() => tableRef.nextPage()} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  )
}
