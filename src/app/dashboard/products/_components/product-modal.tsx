'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
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
import { fileToBase64 } from '~/lib/utils'
import type { Product } from './columns'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productData: {
    id?: string
    name: string
    price: number
    imageBase64: string
  }) => Promise<void>
  product?: Product
}

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  imageBase64: z.string(),
  fileName: z.string(),
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
      imageBase64: product?.imageBase64 || '',
    },
  })

  useEffect(() => {
    if (product) {
      form.setValue('name', product.name || '')
      form.setValue('price', product.price)
      form.setValue('imageBase64', product.imageBase64 || '')
    } else {
      form.reset()
    }
  }, [form, product])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      const file = files[0]
      if (!file) return

      const base64 = await fileToBase64(file)

      form.setValue('imageBase64', base64)
      form.setValue('fileName', file.name)
    },
  })

  const handleSubmit = async (data: z.infer<typeof productSchema>) => {
    await onSubmit({
      id: product?.id,
      name: data.name,
      price: data.price,
      imageBase64: data.imageBase64,
    })
    form.reset({
      name: '',
      price: 0,
      imageBase64: '',
    })
    onClose()
  }

  const image = form.watch('imageBase64')

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
                  alt="Product"
                  className="h-32 w-32 rounded-full object-cover"
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
                  form.setValue('imageBase64', base64)
                  form.setValue('fileName', file.name)
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
