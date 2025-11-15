"use client";

import { useCurrentUser } from "@/services/supabase/hooks/useCurrentUser";
import { useUserRole } from "@/services/supabase/hooks/useUserRole";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "./ui/button";
import { LogoutButton } from "@/services/supabase/components/logout-button";

export default function Navbar() {
  const { user, isLoading } = useCurrentUser();
  const { isAdmin } = useUserRole();
  const pathname = usePathname();

  return (
    <div className="border-b bg-background h-header">
      <nav className="container mx-auto px-4 flex justify-between items-center h-full gap-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Image
            src="/sword-rose.svg"
            alt="Maknoon logo"
            width={24}
            height={24}
            className="w-6 h-6 invert dark:invert-0"
          />
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
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button asChild variant={pathname === '/admin' ? 'default' : 'ghost'} size="sm">
                <Link href="/admin">Admin</Link>
              </Button>
            )}
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
