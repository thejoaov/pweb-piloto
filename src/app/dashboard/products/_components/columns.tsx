'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Circle, DollarSign } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { formatCurrency } from '~/lib/utils'
import type { RouterOutputs } from '~/trpc/react'

export type Product = Exclude<
  RouterOutputs['products']['getList'][number],
  undefined
>

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Circle className="h-4 w-4" />
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'price',
    accessorFn: (product) => formatCurrency(product.price),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <DollarSign className="h-4 w-4" />
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'createdBy',
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center">
          <span className="mr-2">{product.createdBy.name ?? 'N/A'}</span>
          <span> {new Date(product.updatedAt).toLocaleDateString()}</span>
        </div>
      )
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Criado por
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'lastUpdatedBy.name',
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center">
          <span className="mr-2">{product.modifiedBy?.name ?? 'N/A'}</span>
          <span> {new Date(product.updatedAt).toLocaleDateString()}</span>
        </div>
      )
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Modificado por
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]
