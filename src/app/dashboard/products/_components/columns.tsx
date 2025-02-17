'use client'

import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  Circle,
  DollarSign,
  Package,
  Warehouse,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { cn, formatCurrency } from '~/lib/utils'
import type { RouterOutputs } from '~/trpc/react'

export type Product = Exclude<
  RouterOutputs['products']['getList'][number],
  undefined
>

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'imageBase64',
    accessorFn: (user) => user.imageBase64 ?? '',
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center space-x-2">
          {user.imageBase64 ? (
            <img
              src={user.imageBase64}
              alt={row.getValue('imageBase64')}
              className={cn(
                'w-10 h-10 rounded-md hover:scale-[5] hover:cursor-zoom-in hover:translate-x-20 transition-all z-10 hover:z-20',
                row.index <= 1 && 'hover:translate-y-20',
                row.index > row.getAllCells().length && 'hover:-translate-y-20',
              )}
            />
          ) : (
            <Package className="w-10 h-10 rounded-full" />
          )}
        </div>
      )
    },
    header: () => <></>,
  },
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
    accessorKey: 'stock.quantity',
    accessorFn: (product) => product.stock.quantity,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Warehouse className="h-4 w-4" />
          Estoque
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
          <span>
            {product.updatedAt
              ? new Date(product.updatedAt).toLocaleDateString()
              : ''}
          </span>
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
          <span>
            {product.updatedAt
              ? new Date(product.updatedAt).toLocaleDateString()
              : ''}
          </span>
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
