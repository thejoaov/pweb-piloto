'use client'

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
  }) => {
    if (productData.id) {
      await updateProductApi.mutateAsync({
        id: productData.id,
        name: productData.name,
        price: productData.price,
      })
    } else {
      await createProductApi.mutateAsync({
        name: productData.name,
        price: productData.price,
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
  }

  const extendedColumns = [
    ...columns,
    {
      id: 'actions',
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      cell: ({ row, onDelete }: any) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(user.id)
                  toast('User ID copied to clipboard')
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy user ID
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  handleEditProduct(row.original)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user.id)}
                className="text-red-500"
              >
                <Trash className="mr-2 h-4 w-4 text-red" />
                Delete
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
        <h1 className="text-3xl font-bold mb-8 flex-1">Products</h1>
        <Button className="ml-4" onClick={() => setIsProductModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </div>
      <DataTable
        columns={extendedColumns}
        data={products || []}
        onDelete={handleDeleteProduct}
      />
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
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
