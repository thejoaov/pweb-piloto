'use client'

import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  Calendar,
  CalendarClock,
  Mail,
  UserCircle,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import type { users } from '~/server/db/schema'

export type User = typeof users.$inferSelect

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    accessorFn: (user) => user.name ?? 'Sem nome',
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center space-x-2">
          {user.image ? (
            <img
              src={user.image}
              alt={row.getValue('name')}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <UserCircle className="w-6 h-6 rounded-full" />
          )}
          <div>{row.getValue('name')}</div>
        </div>
      )
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Mail className="mr-2 h-4 w-4" />
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'cpf',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Mail className="mr-2 h-4 w-4" />
          CPF
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Mail className="mr-2 h-4 w-4" />
          Permissão
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
          <CalendarClock className="mr-2 h-4 w-4" />
          Criado em
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center">
          <span>
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : ''}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <CalendarClock className="mr-2 h-4 w-4" />
          Atualizado em
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center">
          <span>
            {user.updatedAt
              ? new Date(user.updatedAt).toLocaleDateString()
              : ''}
          </span>
        </div>
      )
    },
  },
]
