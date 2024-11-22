'use client'

import { Check, ChevronsUpDown, Loader2, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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

  const { data: products = [] } = api.products.getList.useQuery({
    perPage: 100,
  })

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'pending')
      setItems(order.items || [])
    } else {
      setStatus('pending')
      setItems([])
    }
  }, [order])

  const calculateTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const product = products?.find((p) => p.id === item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  }, [items, products])

  const isEditable = (order && order.status === 'pending') || !order

  const handleSubmit = async (e: React.FormEvent) => {
    if (!isEditable) {
      return
    }

    e.preventDefault()
    setIsSubmitting(true)
    await onSubmit({
      id: order?.id,
      total: calculateTotal,
      status,
      userId,
      items,
    })
    setIsSubmitting(false)
    setStatus('pending')
    setItems([])
    onClose()
  }

  const addItem = () => {
    setItems([...items, { productId: crypto.randomUUID(), quantity: 1 }])
  }

  const removeItem = (index: number) => {
    if (!order || order.status === 'pending') {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    )
  }

  const updateItem = (index: number, productId: string) => {
    const newItems = items.map((item, _index) =>
      index === _index ? { ...item, productId } : item,
    )

    setItems(newItems)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px]">
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
                <Select
                  disabled={!isEditable}
                  value={status}
                  onValueChange={setStatus}
                >
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
                <div key={item.productId} className="flex items-center gap-2">
                  <Popover
                    open={openProductId === index}
                    onOpenChange={(open) =>
                      setOpenProductId(open ? index : null)
                    }
                  >
                    <PopoverTrigger asChild disabled={!isEditable}>
                      <Button
                        variant="outline"
                        // biome-ignore lint/a11y/useSemanticElements: <explanation>
                        role="combobox"
                        aria-expanded={openProductId === index}
                        className="w-full justify-between"
                        disabled={!isEditable}
                      >
                        {item.productId
                          ? products.find(
                              (product) => product.id === item.productId,
                            )?.name
                          : 'Select product...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          disabled={!isEditable}
                          placeholder="Search product..."
                        />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {products.map((product, index) => (
                              <CommandItem
                                key={product.id}
                                onSelect={() => {
                                  updateItem(index, product.id)
                                  setOpenProductId(null)
                                }}
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
                  <Input
                    type="number"
                    disabled
                    defaultValue={
                      products.find((p) => p.id === item.productId)?.price ?? 0
                    }
                    contentEditable={false}
                    className="w-32"
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    disabled={!isEditable}
                    onChange={(e) =>
                      updateQuantity(
                        item.productId,
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
                    disabled={!isEditable}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                disabled={items.length === products.length || !isEditable}
                onClick={addItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
            <div className="text-right">
              <strong>Total: ${calculateTotal.toFixed(2)}</strong>
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
