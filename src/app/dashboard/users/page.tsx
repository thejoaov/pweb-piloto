'use client'

import { keepPreviousData } from '@tanstack/react-query'
import {
  type ColumnDef,
  type PaginationState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Copy, MoreHorizontal, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DataTable } from '~/components/data-table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { UserRoles } from '~/server/db/schema'
import { api } from '~/trpc/react'
import { type User, columns } from './_components/columns'

export default function UsersPage() {
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 10,
    pageIndex: 0,
  })

  const { data: currentUser } = api.auth.getCurrentUser.useQuery()
  const {
    data: users,
    refetch,
    isLoading,
  } = api.users.getTable.useQuery(pagination, {
    placeholderData: keepPreviousData,
  })

  const deleteUser = api.users.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser.mutate({ id: userToDelete })
      setUserToDelete(null)
    }
  }

  const extendedColumns: ColumnDef<User>[] = [
    ...columns,
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(user.id)
                  toast('ID do usuário copiado para a área de transferência')
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar ID do usuário
              </DropdownMenuItem>
              {user.id !== currentUser?.id &&
                currentUser?.role === UserRoles.ADMIN && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-500"
                    >
                      <Trash className="mr-2 h-4 w-4 text-red" />
                      Excluir
                    </DropdownMenuItem>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    columns: extendedColumns,
    data: users?.rows || [],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableFilters: true,
    enableColumnFilters: true,
    manualPagination: true,
    rowCount: users?.rowCount,
    enableHiding: false,
    pageCount: users?.pageCount,
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  })

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8 flex-1">Usuários</h1>

      <DataTable
        columns={extendedColumns}
        tableRef={table}
        data={users?.rows || []}
        showPagination
        pagination={pagination}
        showLoading
        isLoading={isLoading}
        pageCount={users?.pageCount}
      />
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o
              usuário e removerá seus dados de nossos servidores. Tem certeza de
              que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500" onClick={confirmDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
