"use client";

import { useCurrentUser } from "@/services/supabase/hooks/useCurrentUser";
import { LogoutButton } from "@/services/supabase/components/logout-button";
import { useSidebar } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { PanelLeft } from "lucide-react";

export default function AuthenticatedNavbar() {
  const { user } = useCurrentUser();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center border-b">
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-full px-4 hover:bg-accent transition-colors"
      >
        <PanelLeft className="size-5" />
      </button>
      <Separator orientation="vertical" className="h-4" />
      
      <div className="flex items-center justify-end flex-1 gap-4 px-4">
        <span className="text-sm text-muted-foreground">
          {user?.user_metadata?.preferred_username || user?.email}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}

