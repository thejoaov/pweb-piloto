'use client'

import {
  ChevronDown,
  Home,
  LogOut,
  Package,
  ShoppingCart,
  UserIcon,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar'
import { DEFAULT_AUTH_ROUTE } from '~/config/routes'
import { api } from '~/trpc/react'
import { createClient } from '~/utils/supabase/client'
import { ModeToggle } from './theme-toggle'
import { Button } from './ui/button'

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const userApi = api.auth.getCurrentUser.useQuery()

  const signOut = async () => {
    const supabase = createClient()

    await supabase.auth.signOut()

    router.push(DEFAULT_AUTH_ROUTE)
  }

  return (
    <Sidebar variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center p-4">
              {userApi.data?.image ? (
                <img
                  src={userApi.data?.image ?? undefined}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 rounded-full " />
                </div>
              )}
              <div className="ml-4">
                <h2 className="text-lg font-semibold">{userApi.data?.name}</h2>
                <p className="text-sm text-gray-500">{userApi.data?.email}</p>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarHeader>
                <div className="flex items-center">
                  <h2 className="text-lg flex-1 font-semibold">Menu</h2>
                  <ModeToggle />
                </div>
              </SidebarHeader>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Tela inicial</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/dashboard/users'}
                >
                  <Link href="/dashboard/users">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Package className="mr-2 h-4 w-4" />
                    <span>Produtos</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent asChild>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href="/dashboard/products">Lista</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href="/dashboard/products?new=true">
                          Novo produto
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>Pedidos</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent asChild>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href="/dashboard/orders">Lista</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href="/dashboard/orders?new=true">
                          Novo Pedido
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button variant="destructive" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Deslogar
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
