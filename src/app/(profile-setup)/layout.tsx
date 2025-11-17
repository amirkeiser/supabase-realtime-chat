import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AuthenticatedNavbar from "@/components/authenticated-navbar";

export default function ProfileSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarInset>
        <AuthenticatedNavbar />
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

