'use client'

import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  CheckCircle2,
  CircleX,
  Copy,
  Edit,
  Loader2,
  LoaderPinwheel,
  MoreHorizontal,
  Plus,
  Timer,
  Trash,
  Watch,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
import { cn } from '~/lib/utils'
import { api } from '~/trpc/react'
import { type GetOrderList, type Order, columns } from './_components/columns'
import { OrderModal } from './_components/order-modal'

export default function OrdersPage() {
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState<Order | undefined>(undefined)
  const { data: orders, refetch } = api.orders.getList.useQuery({
    perPage: 20,
  })
  const createOrderApi = api.orders.create.useMutation()
  const updateOrderApi = api.orders.update.useMutation()
  const advanceStatusApi = api.orders.update.useMutation()
  const deleteOrderApi = api.orders.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const { data: user } = api.auth.getCurrentUser.useQuery()

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.has('new')) {
      setIsOrderModalOpen(true)
    }
  }, [searchParams])

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId)
  }

  const confirmDelete = () => {
    if (orderToDelete) {
      deleteOrderApi.mutate({ id: orderToDelete })
      setOrderToDelete(null)
    }
  }

  const handleOrderSubmit = async (orderData: {
    id?: string
    total: number
    status: string
    userId: string
    items: { productId: string; quantity: number }[]
  }) => {
    if (orderData.id) {
      await updateOrderApi.mutateAsync({
        id: orderData.id,
        total: orderData.total,
        status: orderData.status,
        userId: orderData.userId,
        items: orderData.items,
      })
    } else {
      await createOrderApi.mutateAsync({
        total: orderData.total,
        status: orderData.status,
        userId: orderData.userId,
        items: orderData.items,
      })
    }
    refetch()
    router.push('/dashboard/orders')
  }

  const handleEditOrder = (order: Order) => {
    setOrderToEdit(order)
    setIsOrderModalOpen(true)
  }

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false)
    setOrderToEdit(undefined)
  }

  const handleAdvanceOrder = async (order: Order) => {
    if (order.status === 'completed') {
      toast('Order is already completed')
      return
    }

    const nextStatus = order.status === 'pending' ? 'processing' : 'completed'
    await advanceStatusApi.mutateAsync({
      id: order.id,
      status: nextStatus,
    })

    toast(`Order status changed to ${nextStatus}`)
    refetch()
  }

  const extendedColumns: ColumnDef<GetOrderList[number]>[] = [
    {
      id: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original

        return (
          <Button
            variant="ghost"
            disabled={
              advanceStatusApi.isPending ||
              ['completed', 'canceled'].includes(order.status as string)
            }
            onClick={() => handleAdvanceOrder(order)}
            className={cn(
              'h-8 w-fit p-0',
              order.status === 'pending' && 'text-blue-500',
              order.status === 'processing' && 'text-yellow-600',
              order.status === 'completed' && 'text-green-500',
              order.status === 'cancelled' && 'text-red-500',
            )}
          >
            {advanceStatusApi.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {order.status === 'pending' && (
                  <Timer className="h-4 w-4 mr-2" />
                )}
                {order.status === 'processing' && (
                  <LoaderPinwheel className="h-4 w-4 mr-2" />
                )}
                {order.status === 'completed' && (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                {order.status === 'cancelled' && (
                  <CircleX className="h-4 w-4 mr-2" />
                )}
              </>
            )}
            {order.status}
          </Button>
        )
      },
    },
    ...columns,
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const order = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(order.id)
                  toast('Order ID copied to clipboard')
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy order ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteOrder(order.id)}
                className="text-red-500"
              >
                <Trash className="mr-2 h-4 w-4 text-red" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto p-10">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold mb-8 flex-1">Orders</h1>
        <Button className="ml-4" onClick={() => setIsOrderModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>
      <DataTable
        columns={extendedColumns as []}
        data={orders || []}
        onDelete={handleDeleteOrder}
      />
      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={() => setOrderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order and remove its data from our servers.
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
      <OrderModal
        userId={user?.id as string}
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        onSubmit={handleOrderSubmit}
        order={orderToEdit}
      />
    </div>
  )
}
