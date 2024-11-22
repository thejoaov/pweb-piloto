import type React from 'react'
import { DashboardSidebar } from '~/components/sidebar'
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'

export default async function Layout({ children }: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarTrigger />

      {children}
    </SidebarProvider>
  )
}
