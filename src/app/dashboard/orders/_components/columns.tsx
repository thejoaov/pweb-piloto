'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import type { RouterOutputs } from '~/trpc/react'

export type GetOrderList = Exclude<RouterOutputs['orders']['getList'], never>
export type Order = Exclude<RouterOutputs['orders']['getById'], null>

export const columns: ColumnDef<GetOrderList[number]>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell(props) {
      return (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          className="w-20 truncate cursor-pointer hover:underline"
          title={props.row.getValue('id')}
          onClick={() => {
            navigator.clipboard.writeText(props.row.getValue('id'))
            toast('Copied order ID to clipboard')
          }}
        >
          {props.row.getValue('id')}
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
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: 'user.name',
    header: 'User',
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString()
    },
  },
]
