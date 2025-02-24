'use client'

import { keepPreviousData } from '@tanstack/react-query'
import {
  type ColumnDef,
  type PaginationState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  CheckCircle2,
  CircleX,
  Clock,
  Copy,
  Download,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  PackageOpen,
  Plus,
  Timer,
  Trash,
} from 'lucide-react'
import dynamic from 'next/dynamic'
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
import { OrderItemStatus, UserRoles } from '~/server/db/schema'
import { api } from '~/trpc/react'
import { type Order, columns } from './_components/columns'

const PaymentModal = dynamic(() => import('./_components/payment-modal'), {
  ssr: false,
})

const OrderModal = dynamic(() => import('./_components/order-modal'), {
  ssr: false,
})

export default function OrdersPage() {
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState<Order | undefined>(undefined)
  const [orderToView, setOrderToView] = useState<Order | undefined>(undefined)
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 10,
    pageIndex: 0,
  })
  const {
    data: orders,
    refetch,
    isLoading,
  } = api.orders.getTable.useQuery(pagination, {
    placeholderData: keepPreviousData,
  })
  const createOrderApi = api.orders.create.useMutation()
  const updateOrderApi = api.orders.update.useMutation()
  const advanceStatusApi = api.orders.advanceStatus.useMutation()
  const deleteOrderApi = api.orders.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })
  const apiUtils = api.useUtils()

  const { data: user } = api.auth.getCurrentUser.useQuery()

  const searchParams = useSearchParams()
  const router = useRouter()

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case OrderItemStatus.NEW:
        return 'Pendente'
      case OrderItemStatus.WAITING_PAYMENT:
        return 'Pagamento'
      case OrderItemStatus.IN_PROGRESS:
        return 'Separação'
      case OrderItemStatus.COMPLETED:
        return 'Concluída'
      case OrderItemStatus.CANCELLED:
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
      toast('Pedido excluído com sucesso', {
        icon: <CheckCircle2 className="h-4 w-4" />,
        className: 'bg-green-500',
      })
    }
  }

  const handleOrderSubmit = async (
    orderData: Omit<Order, 'id'> & { id?: string },
  ) => {
    if (orderData.id) {
      await updateOrderApi.mutateAsync({
        id: orderData.id,
        total: orderData.total,
        status: orderData.status,
        userId: orderData.userId,
        // @ts-expect-error
        items: orderData.items.map((i) => ({
          ...i,
          orderId: orderData.id as string,
        })),
      })
    } else {
      await createOrderApi.mutateAsync({
        total: orderData.total,
        userId: orderData.userId,
        // @ts-expect-error
        items: orderData.items,
        clientId: orderData.client?.id || orderData.clientId,
        status: OrderItemStatus.NEW,
      })
    }
    refetch()
    router.push('/dashboard/orders')
  }

  const handleEditOrder = (order: Order) => {
    setOrderToEdit(order)
    setIsOrderModalOpen(true)
  }

  const handleViewOrder = (order: Order) => {
    setOrderToView(order)
    setIsOrderModalOpen(true)
  }

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false)
    setOrderToEdit(undefined)
    setOrderToView(undefined)
  }

  const handleAdvanceOrder = async (order: Order) => {
    if (order.status === OrderItemStatus.COMPLETED) {
      toast('Essa pedido já foi concluído')
      return
    }

    if (order.status === OrderItemStatus.WAITING_PAYMENT) {
      setOrderToView(order)
      setIsPaymentModalOpen(true)
      return
    }

    const { status } = await advanceStatusApi.mutateAsync(order.id)
    await apiUtils.orders.getTable.invalidate()
    await apiUtils.orders.getTable.reset(pagination)

    toast(`Status do pedido agora é ${getStatusTranslation(status)}`, {
      className: 'bg-green-500',
    })
    refetch()
  }

  const isAdmin = user?.role === UserRoles.ADMIN

  const isOwner = (order: Order) => {
    return order.userId === user?.id
  }

  const hasModifyPermission = (order: Order) => {
    return !(
      (isOwner(order) && order.status === OrderItemStatus.NEW) ||
      isAdmin
    )
  }

  const extendedColumns: ColumnDef<Order>[] = [
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
              ([OrderItemStatus.COMPLETED, OrderItemStatus.CANCELLED].includes(
                order.status as OrderItemStatus,
              ) &&
                !isAdmin)
            }
            onClick={() => handleAdvanceOrder(order)}
            className={cn(
              'h-8 w-fit p-0',
              order.status === OrderItemStatus.NEW && 'text-blue-500',
              order.status === OrderItemStatus.IN_PROGRESS && 'text-yellow-600',
              order.status === OrderItemStatus.WAITING_PAYMENT &&
                'text-purple-500',
              order.status === OrderItemStatus.COMPLETED && 'text-green-500',
              order.status === OrderItemStatus.CANCELLED && 'text-red-500',
            )}
          >
            {advanceStatusApi.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {order.status === OrderItemStatus.NEW && (
                  <Timer className="h-4 w-4" />
                )}
                {order.status === OrderItemStatus.IN_PROGRESS && (
                  <PackageOpen className="h-4 w-4" />
                )}
                {order.status === OrderItemStatus.WAITING_PAYMENT && (
                  <Clock className="h-4 w-4" />
                )}
                {order.status === OrderItemStatus.COMPLETED && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {order.status === OrderItemStatus.CANCELLED && (
                  <CircleX className="h-4 w-4" />
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
              <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {!hasModifyPermission(order) && (
                <>
                  <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {[
                OrderItemStatus.COMPLETED,
                OrderItemStatus.IN_PROGRESS,
              ].includes(order.status) && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(`/dashboard/orders/invoices/${order.id}`)
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Nota Fiscal
                  </DropdownMenuItem>
                  {!hasModifyPermission(order) && <DropdownMenuSeparator />}
                </>
              )}

              {!hasModifyPermission(order) && (
                <DropdownMenuItem
                  onClick={() => handleDeleteOrder(order.id)}
                  className="text-red-500"
                >
                  <Trash className="mr-2 h-4 w-4 text-red" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    columns: extendedColumns,
    data: orders?.rows || [],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: true,
    manualPagination: true,
    rowCount: orders?.rowCount,
    enableHiding: false,
    pageCount: orders?.pageCount,
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  })

  return (
    <div className="container mx-auto p-10">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold mb-8 flex-1">Pedidos</h1>
        <Button className="ml-4" onClick={() => setIsOrderModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pedido
        </Button>
      </div>
      <DataTable
        columns={extendedColumns as []}
        data={orders?.rows || []}
        tableRef={table}
        showPagination
        pagination={pagination}
        pageCount={orders?.pageCount}
        showLoading
        isLoading={isLoading}
      />

      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={() => setOrderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Você tem certeza que deseja excluir esse pedido?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Todos os dados relacionados a
              esse pedido serão perdidos.
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

      {isOrderModalOpen && (
        <OrderModal
          userId={user?.id as string}
          isOpen={isOrderModalOpen}
          onClose={handleCloseOrderModal}
          onSubmit={handleOrderSubmit}
          order={orderToEdit || orderToView}
          readonly={!!orderToView}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            setOrderToView(undefined)
          }}
          order={orderToView as Order}
        />
      )}
    </div>
  )
}
