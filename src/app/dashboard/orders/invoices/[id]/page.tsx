import { Loader } from 'lucide-react'
import { Suspense } from 'react'
import { api } from '~/trpc/server'
import { InvoiceTemplate } from '../../_components/invoice-template'

export default async function Layout({
  params,
}: { params: Promise<{ id: string }> }) {
  const orderId = (await params).id

  const order = await api.orders.getById({
    id: orderId,
  })

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader size={64} className="animate-spin" />
        </div>
      }
    >
      <InvoiceTemplate order={order} />
    </Suspense>
  )
}
