'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Copy, Edit, MoreHorizontal, Plus, Trash } from 'lucide-react'
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
import { api } from '~/trpc/react'
import { type Product, columns } from './_components/columns'
import { ProductModal } from './_components/product-modal'

export default function ProductsPage() {
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(
    undefined,
  )
  const { data: products, refetch } = api.products.getList.useQuery({
    perPage: 20,
  })
  const createProductApi = api.products.create.useMutation()
  const updateProductApi = api.products.update.useMutation()
  const deleteProductApi = api.products.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.has('new')) {
      setIsProductModalOpen(true)
    }
  }, [searchParams])

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductApi.mutate({ id: productToDelete })
      setProductToDelete(null)
    }
  }

  const handleProductSubmit = async (productData: {
    id?: string
    name: string
    price: number
    imageBase64: string
  }) => {
    if (productData.id) {
      await updateProductApi.mutateAsync({
        id: productData.id,
        name: productData.name,
        price: productData.price,
        imageBase64: productData.imageBase64,
      })
    } else {
      await createProductApi.mutateAsync({
        name: productData.name,
        price: productData.price,
        imageBase64: productData.imageBase64,
      })
    }
    refetch()
    // This is a hack to remove the `new` query param from the URL
    router.push('/dashboard/products')
  }

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product)
    setIsProductModalOpen(true)
  }

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false)
    setProductToEdit(undefined)
    // This is a hack to remove the `new` query param from the URL
    router.push('/dashboard/products')
  }

  const extendedColumns: ColumnDef<Product>[] = [
    ...columns,
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const product = row.original

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
                  navigator.clipboard.writeText(product.id)
                  toast('User ID copied to clipboard')
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar ID do Produto
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  handleEditProduct(product)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteProduct(product.id)}
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
        <h1 className="text-3xl font-bold mb-8 flex-1">Produtos</h1>
        <Button className="ml-4" onClick={() => setIsProductModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>
      <DataTable columns={extendedColumns} data={products || []} />
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Você tem certeza que deseja
              excluir esse produto?
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
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        onSubmit={handleProductSubmit}
        product={productToEdit}
      />
    </div>
  )
}
