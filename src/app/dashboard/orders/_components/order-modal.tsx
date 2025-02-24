'use client'

import { Check, ChevronsUpDown, Download, Loader2, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { cn, formatCurrency } from '~/lib/utils'
import { OrderItemStatus } from '~/server/db/schema'
import { type RouterInputs, api } from '~/trpc/react'
import type { Order } from './columns'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (orderData: Omit<Order, 'id'> & { id?: string }) => Promise<void>
  order?: Order
  userId: string
  readonly?: boolean
}

export type OrderCreate = RouterInputs['orders']['create']

export default function OrderModal({
  isOpen,
  onClose,
  onSubmit,
  order,
  readonly = false,
  userId,
}: OrderModalProps) {
  const [status, setStatus] = useState<`${OrderItemStatus}`>(
    order?.status || OrderItemStatus.IN_PROGRESS,
  )
  const [items, setItems] = useState<
    {
      productId: string
      quantity: number
    }[]
  >([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openProductId, setOpenProductId] = useState<number | null>(null)
  const [client, setClient] = useState<Order['client'] | null>(null)
  const [openClientSelector, setOpenClientSelector] = useState(false)

  const clientList = api.users.getList.useQuery()

  const { data: products, isLoading: isLoadingProducts } =
    api.products.getList.useQuery({ perPage: 100 })

  const router = useRouter()

  useEffect(() => {
    if (order) {
      setStatus(order.status || OrderItemStatus.IN_PROGRESS)
      setItems(order.items)
      setClient(order.client)
    } else {
      setStatus(OrderItemStatus.IN_PROGRESS)
      setItems([])
    }
  }, [order])

  const calculateTotal = () => {
    return Number(
      items
        .reduce((total, item) => {
          const product = products?.find((p) => p.id === item.productId)
          return total + (product?.price || 0) * item.quantity
        }, 0)
        .toFixed(2),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        id: order?.id,
        total: Number(calculateTotal().toFixed(2)),
        status: status as OrderItemStatus,
        userId,
        items,
        clientId: client?.id,
        client,
      } as Order)
      setStatus(OrderItemStatus.IN_PROGRESS)
      setItems([])
      onClose()
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      toast('Falha ao criar pedido', {
        description: 'Tente novamente mais tarde',
        className: 'bg-red-500',
      })
      console.error('Falha ao criar pedido', error)
    } finally {
      setIsSubmitting(false)
      toast('Pedido criado com sucesso', {
        className: 'bg-green-500',
      })
    }
  }

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1 } as Order['items'][0]])
  }

  const removeItem = (index: number) => {
    if (!order || order.status === OrderItemStatus.IN_PROGRESS) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const getProductById = (productId: string) => {
    return products?.find((product) => product.id === productId)
  }

  const updateItem = (
    index: number,
    field: 'productId' | 'quantity',
    value: string | number,
  ) => {
    setItems((prevItems) => {
      const newItems = [...prevItems]
      if (field === 'productId') {
        newItems[index] = {
          ...newItems[index],
          productId: value as string,
          quantity: 1,
        } as { productId: string; quantity: number }
      } else {
        newItems[index] = {
          ...newItems[index],
          quantity: value,
        } as { productId: string; quantity: number }
      }
      return newItems
    })
    if (field === 'productId') {
      setOpenProductId(null)
    }
  }

  const renderClientSelector = useMemo(() => {
    if (clientList.isLoading || !clientList.data) {
      return (
        <div>
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
    }

    return (
      <Popover
        open={openClientSelector}
        onOpenChange={(open) => setOpenClientSelector(open)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            // biome-ignore lint/a11y/useSemanticElements: <explanation>
            role="combobox"
            disabled={readonly}
            className="w-full justify-between"
          >
            {client
              ? client.name || 'Selecione o cliente...'
              : 'Selecione o cliente...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              disabled={readonly}
              placeholder="Pesquise o cliente..."
            />
            <CommandList>
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
              <CommandGroup>
                {clientList?.data?.map((c) => (
                  <CommandItem
                    key={c.id}
                    onSelect={() => {
                      setClient(c)
                      setOpenClientSelector(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        c.id === client?.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {c?.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }, [client, clientList, openClientSelector, readonly])

  const renderProductSelector = (
    index: number,
    item: {
      productId: string
      quantity: number
    },
  ) => {
    if (isLoadingProducts || !products) {
      return (
        <div>
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
    }

    const availableProducts = products.filter(
      (product) =>
        !items.some((item) => item.productId === product.id) ||
        item.productId === product.id,
    )

    return (
      <Popover
        open={openProductId === index}
        onOpenChange={(open) => setOpenProductId(open ? index : null)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            // biome-ignore lint/a11y/useSemanticElements: <explanation>
            role="combobox"
            aria-expanded={openProductId === index}
            disabled={readonly}
            className="w-full justify-between"
          >
            {item.productId
              ? getProductById(item.productId)?.name || 'Selecione o produto...'
              : 'Selecione o produto...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              disabled={readonly}
              placeholder="Pesquise o produto..."
            />
            <CommandList>
              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
              <CommandGroup>
                {availableProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => updateItem(index, 'productId', product.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        item.productId === product.id
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {product.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  if (!isOpen) return null

  const getTitle = () => {
    if (readonly) return 'Detalhes do Pedido'
    return order ? 'Editar Pedido' : 'Novo Pedido'
  }

  const getButtonText = () => {
    if (readonly) return 'Fechar'
    return order ? 'Salvar Edição' : 'Criar Pedido'
  }

  return (
    <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {order && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    disabled={readonly}
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as OrderItemStatus)
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderItemStatus.NEW}>Novo</SelectItem>
                      <SelectItem value={OrderItemStatus.IN_PROGRESS}>
                        Em separação
                      </SelectItem>
                      <SelectItem value={OrderItemStatus.WAITING_PAYMENT}>
                        Aguardando Pagamento
                      </SelectItem>
                      <SelectItem value={OrderItemStatus.COMPLETED}>
                        Concluído
                      </SelectItem>
                      <SelectItem value={OrderItemStatus.CANCELLED}>
                        Cancelado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="items-center gap-4 flex flex-row mb-8">
                <Label htmlFor="client" className="text-right">
                  Cliente
                </Label>
                {client && (
                  <img
                    src={client.image || undefined}
                    alt={client.name || 'Client'}
                    className="w-8 h-8 hover:scale-[5] rounded-full transition-all z-10 hover:z-20"
                  />
                )}
                {renderClientSelector}
              </div>

              <div className="grid gap-4">
                <Label>Itens no pedido</Label>
                {items.map((item, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <div key={index} className="flex items-center gap-2">
                    {getProductById(item.productId) && (
                      <img
                        src={
                          getProductById(item.productId)?.imageBase64 ||
                          undefined
                        }
                        alt={getProductById(item.productId)?.name}
                        className="w-10 h-10 rounded-md hover:scale-[5] transition-all z-10 hover:z-20"
                      />
                    )}
                    {renderProductSelector(index, item)}
                    <Input
                      disabled={readonly}
                      type="number"
                      value={item.quantity}
                      max={getProductById(item.productId)?.stock.quantity}
                      onChange={(e) => {
                        updateItem(
                          index,
                          'quantity',
                          Math.max(1, Number.parseInt(e.target.value)),
                        )
                      }}
                      min={1}
                      className="w-20"
                    />
                    {!readonly && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeItem(index)}
                        disabled={
                          order && order.status !== OrderItemStatus.IN_PROGRESS
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {!readonly && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    disabled={readonly}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Item
                  </Button>
                )}
              </div>
              <div className="text-right">
                <strong>Total: {formatCurrency(calculateTotal())}</strong>
              </div>
            </div>
            <DialogFooter>
              {!readonly ? (
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !items.length ||
                    // Items are required
                    // They should not have empty ids
                    items.some((item) => !item.productId.length) ||
                    !client
                  }
                >
                  {getButtonText()}
                  {isSubmitting && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </Button>
              ) : (
                order?.status === OrderItemStatus.COMPLETED && (
                  <Button
                    type="button"
                    onClick={() =>
                      router.push(`/dashboard/orders/invoices/${order?.id}`)
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Nota Fiscal
                  </Button>
                )
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Suspense>
  )
}
