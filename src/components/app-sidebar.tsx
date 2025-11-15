"use client"

import {
  Home,
  Users,
  MessageSquare,
  UserCircle,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUserRole } from "@/services/supabase/hooks/useUserRole"

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Connections",
    url: "/",
    icon: Users,
  },
  {
    title: "Rooms",
    url: "/rooms/new",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    url: "/profile/setup",
    icon: UserCircle,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { isAdmin } = useUserRole()

  return (
    <Sidebar>
      <SidebarHeader className="h-16 border-b flex items-center p-0">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 text-xl font-bold group-data-[collapsible=icon]:justify-center w-full h-full"
        >
          <Image
            src="/sword-rose.svg"
            alt="Maknoon logo"
            width={24}
            height={24}
            className="w-6 h-6 invert dark:invert-0 shrink-0"
          />
          <span className="group-data-[collapsible=icon]:hidden">Maknoon</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                    <Link href="/admin">
                      <Shield />
                      <span>Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

