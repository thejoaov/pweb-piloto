'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, UserCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import type { RouterOutputs } from '~/trpc/react'

export type GetOrderList = Exclude<RouterOutputs['orders']['getList'], never>
export type Order = Exclude<RouterOutputs['orders']['getById'], null>

export const columns: ColumnDef<GetOrderList[number]>[] = [
  {
    accessorKey: 'id',
    header: 'ID (clique para copiar)',
    cell(props) {
      return (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          className="w-fit truncate cursor-pointer hover:underline"
          title={props.row.getValue('id')}
          onClick={() => {
            navigator.clipboard.writeText(props.row.getValue('id'))
            toast('ID copiado para a área de transferência')
          }}
        >
          {(props.row.getValue('id') as string).slice(0, 8)}...
        </div>
      )
    },
  },
  {
    accessorKey: 'total',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('total'))
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount)
      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: 'user.name',
    accessorFn: (order) => order.user?.name ?? 'Sem nome',
    header: 'Usuário',
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="flex items-center space-x-2">
          {order.user?.image ? (
            <img
              src={order.user.image}
              alt={row.getValue('name')}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <UserCircle className="w-6 h-6 rounded-full" />
          )}
          <div>{order.user?.name}</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Criada em
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString()
    },
  },
  {
    accessorKey: 'lastUpdatedBy.name',
    cell: ({ row }) => {
      const product = row.original
      return (
        product.modifiedBy?.name && (
          <div className="flex items-center">
            <span className="mr-2">{product.modifiedBy?.name ?? 'N/A'}</span>
            <span> {new Date(product.updatedAt).toLocaleString()}</span>
          </div>
        )
      )
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Última modificação
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]
