import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import AuthenticatedNavbar from "@/components/authenticated-navbar"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AuthenticatedNavbar />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

