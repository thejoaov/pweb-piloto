import type React from 'react'
import { DashboardSidebar } from '~/components/sidebar'
import { SidebarProvider } from '~/components/ui/sidebar'

export default async function Layout({ children }: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      {children}
    </SidebarProvider>
  )
}
