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

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'processing':
        return 'Processando'
      case 'completed':
        return 'Concluída'
      case 'cancelled':
        return 'Cancelada'
      default:
        return 'Desconhecido'
    }
  }

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
      toast('Essa ordem já foi concluída')
      return
    }

    const nextStatus = order.status === 'pending' ? 'processing' : 'completed'
    await advanceStatusApi.mutateAsync({
      id: order.id,
      status: nextStatus,
    })

    toast(`Status da ordem agora é ${getStatusTranslation(nextStatus)}`)
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
                  <Watch className="h-4 w-4 mr-2" />
                )}
                {order.status === 'completed' && (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                {order.status === 'cancelled' && (
                  <CircleX className="h-4 w-4 mr-2" />
                )}
                {getStatusTranslation(order.status as string)}
              </>
            )}
          </Button>
        )
      },
    },
    ...columns,
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const order = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(order.id)
                  toast('Copiado para a área de transferência')
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={order.status !== 'pending'}
                onClick={() => handleEditOrder(order)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={order.status !== 'pending'}
                onClick={() => handleDeleteOrder(order.id)}
                className="text-red-500"
              >
                <Trash className="mr-2 h-4 w-4 text-red" />
                Excluir
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
        <h1 className="text-3xl font-bold mb-8 flex-1">Ordens</h1>
        <Button className="ml-4" onClick={() => setIsOrderModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem
        </Button>
      </div>
      <DataTable columns={extendedColumns as []} data={orders || []} />
      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={() => setOrderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Você tem certeza que deseja excluir essa ordem?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Todos os dados relacionados a
              essa ordem serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500">
              <Trash className="mr-2 h-4 w-4" />
              Sim, excluir
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
