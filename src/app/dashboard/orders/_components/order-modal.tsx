'use client'

import { Check, ChevronsUpDown, Loader2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { api } from '~/trpc/react'
import type { Order } from './columns'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (orderData: {
    id?: string
    total: number
    status: string
    userId: string
    items: { productId: string; quantity: number }[]
  }) => Promise<void>
  order?: Order
  userId: string
  readonly?: boolean
}

export function OrderModal({
  isOpen,
  onClose,
  onSubmit,
  order,
  readonly = false,
  userId,
}: OrderModalProps) {
  const [status, setStatus] = useState(order?.status || 'pending')
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>(
    [],
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openProductId, setOpenProductId] = useState<number | null>(null)

  const { data: products, isLoading: isLoadingProducts } =
    api.products.getList.useQuery({ perPage: 100 })

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'pending')
      setItems(order.items)
    } else {
      setStatus('pending')
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
        status,
        userId,
        items,
      })
      setStatus('pending')
      setItems([])
      onClose()
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      toast('Falha ao criar pedido', {
        description: error.message as string,
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
    setItems([...items, { productId: '', quantity: 1 }])
  }

  const removeItem = (index: number) => {
    if (!order || order.status === 'pending') {
      setItems(items.filter((_, i) => i !== index))
    }
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
        }
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

  const renderProductSelector = (
    index: number,
    item: { productId: string; quantity: number },
  ) => {
    if (isLoadingProducts || !products) {
      return <div>Carregando produtos...</div>
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
              ? products.find((product) => product.id === item.productId)
                  ?.name || 'Selecione o produto...'
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
                  onValueChange={setStatus}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-4">
              <Label>Itens no pedido</Label>
              {items.map((item, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <div key={index} className="flex items-center gap-2">
                  {renderProductSelector(index, item)}
                  <Input
                    disabled={readonly}
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        'quantity',
                        Math.max(1, Number.parseInt(e.target.value)),
                      )
                    }
                    min={1}
                    className="w-20"
                  />
                  {!readonly && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeItem(index)}
                      disabled={order && order.status !== 'pending'}
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
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={readonly ? onClose : undefined}
            >
              {getButtonText()}
              {isSubmitting && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
