'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
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
import { api } from '~/trpc/react'
import { columns } from './_components/columns'

export default function UsersPage() {
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const { data: users, refetch } = api.users.getList.useQuery({
    perPage: 20,
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

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8 flex-1">Users</h1>

      <DataTable
        columns={columns}
        data={users || []}
        onDelete={handleDeleteUser}
      />
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user's account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
