'use client'

import { Package, ShoppingCart, Users } from 'lucide-react'
import { StatusCard } from '~/components/status-card'
import { api } from '~/trpc/react'

export default function DashboardPage() {
  const { data } = api.dashboard.getStatus.useQuery()

  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="mb-6 text-3xl font-bold">Tela inicial</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatusCard
            title="Usuários"
            value={data?.usersCount ?? 0}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <StatusCard
            title="Produtos"
            value={data?.productsCount ?? 0}
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
          />
          <StatusCard
            title="Ordens"
            value={data?.ordersCount ?? 0}
            icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      </main>
    </div>
  )
}
