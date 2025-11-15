"use client";

import { useCurrentUser } from "@/services/supabase/hooks/useCurrentUser";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { LogoutButton } from "@/services/supabase/components/logout-button";

export default function Navbar() {
  const { user, isLoading } = useCurrentUser();
  const pathname = usePathname();

  return (
    <div className="border-b bg-background h-header">
      <nav className="container mx-auto px-4 flex justify-between items-center h-full gap-4">
        <Link href="/" className="text-xl font-bold">
          Maknoon
        </Link>

        {isLoading || user == null ? (
          pathname === "/auth/login" ? (
            <Button asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user.user_metadata?.preferred_username || user.email}
            </span>
            <LogoutButton />
          </div>
        )}
      </nav>
    </div>
  );
}
