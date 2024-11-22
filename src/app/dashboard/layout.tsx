import type React from 'react'
import { DashboardSidebar } from '~/components/sidebar'
import { ModeToggle } from '~/components/theme-toggle'
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'

export default async function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <SidebarProvider>
        <DashboardSidebar />

        {children}
      </SidebarProvider>
    </>
  )
}
