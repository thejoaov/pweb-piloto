'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { FormField } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { Product } from './columns'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productData: {
    id?: string
    name: string
    price: number
  }) => Promise<void>
  product?: Product
}

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.coerce
    .number()
    .positive('Valor deve ser positivo')
    .transform((v) => {
      return Number.parseFloat(v.toFixed(2))
    }),
})

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  product,
}: ProductModalProps) {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price || 0,
    },
  })

  useEffect(() => {
    if (product) {
      form.setValue('name', product.name || '')
      form.setValue('price', product.price)
    } else {
      form.reset()
    }
  }, [form, product])

  const handleSubmit = async (data: z.infer<typeof productSchema>) => {
    await onSubmit({
      id: product?.id,
      name: data.name,
      price: data.price,
    })
    form.reset({
      name: '',
      price: 0,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Produto' : 'Novo produto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    className="col-span-3"
                    placeholder="Nome do produto"
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Valor
              </Label>
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <Input {...field} prefix="R$" className="col-span-3" />
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {product ? 'Atualizar' : 'Salvar'} Produto
              {form.formState.isSubmitting && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
