'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { StyledDropzone } from '~/components/dropzone'
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
import { currencyToFloat, fileToBase64, formatCurrency } from '~/lib/utils'
import type { Product } from './columns'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productData: {
    id?: string
    name: string
    price: number
    imageBase64: string
    quantity: number
  }) => Promise<void>
  product?: Product
}

const productSchema = z.object({
  id: z.string().optional(),
  imageBase64: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  quantity: z.coerce
    .number()
    .positive('Quantidade deve ser positivo')
    .min(1)
    .max(1000000),
  price: z.coerce.string().transform(currencyToFloat),
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
      price: product?.price,
      imageBase64: product?.imageBase64 || '',
      quantity: product?.stock.quantity || 0,
    },
  })

  useEffect(() => {
    if (product) {
      form.setValue('name', product.name || '')
      form.setValue('price', product.price)
      form.setValue('imageBase64', product.imageBase64 || '')
      form.setValue('id', product.id)
      form.setValue('quantity', product.stock.quantity || 0)
    } else {
      form.reset()
    }
  }, [form, product])

  const handleSubmit = async (data: z.infer<typeof productSchema>) => {
    await onSubmit({
      id: product?.id,
      name: data.name,
      price: data.price,
      imageBase64: data.imageBase64,
      quantity: data.quantity,
    })
    form.reset({
      id: undefined,
      name: '',
      price: 0,
      imageBase64: '',
      quantity: 0,
    })
    onClose()
  }

  const image = form.watch('imageBase64')
  const name = form.watch('name')

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
            <div className="flex flex-1 flex-col items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-32 h-32 rounded-md hover:scale-[2] transition-all z-10 hover:z-20"
                />
              ) : null}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageBase64" className="text-right">
                Imagem
              </Label>

              <StyledDropzone
                className="w-full col-span-3 cursor-pointer rounded-lg"
                accept={{ 'image/*': [] }}
                onDrop={async (files) => {
                  const file = files[0]
                  if (!file) return
                  const base64 = await fileToBase64(file)
                  form.setValue('imageBase64', base64, {
                    shouldDirty: true,
                    shouldValidate: true,
                    shouldTouch: true,
                  })
                }}
              />
              {form.formState.errors.imageBase64 && (
                <p className="text-red-500">
                  {form.formState.errors.imageBase64.message}
                </p>
              )}
            </div>
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
              {form.formState.errors.name && (
                <p className="text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Valor
              </Label>

              <FormField
                name="price"
                control={form.control}
                render={({ field }) => (
                  <Input
                    type="currency"
                    {...field}
                    className="col-span-3 text-start"
                  />
                )}
              />
              {form.formState.errors.price && (
                <p className="text-red-500">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantidade
              </Label>
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <Input {...field} className="col-span-3" />
                )}
              />
              {form.formState.errors.quantity && (
                <p className="text-red-500">
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!form.formState.isValid}>
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
