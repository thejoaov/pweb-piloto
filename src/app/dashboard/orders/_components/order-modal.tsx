'use client'

import { Check, ChevronsUpDown, Loader2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { cn } from '~/lib/utils'
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
}

export function OrderModal({
  isOpen,
  onClose,
  onSubmit,
  order,
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
    return items.reduce((total, item) => {
      const product = products?.find((p) => p.id === item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
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
    } catch (error) {
      console.error('Error submitting order:', error)
    } finally {
      setIsSubmitting(false)
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
      return <div>Loading products...</div>
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
            className="w-[200px] justify-between"
          >
            {item.productId
              ? products.find((product) => product.id === item.productId)
                  ?.name || 'Select product...'
              : 'Select product...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search product..." />
            <CommandList>
              <CommandEmpty>No product found.</CommandEmpty>
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{order ? 'Edit Order' : 'Create New Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {order && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-4">
              <Label>Order Items</Label>
              {items.map((item, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <div key={index} className="flex items-center gap-2">
                  {renderProductSelector(index, item)}
                  <Input
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                    disabled={order && order.status !== 'pending'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
            <div className="text-right">
              <strong>Total: ${calculateTotal().toFixed(2)}</strong>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {order ? 'Update' : 'Create'} Order
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
