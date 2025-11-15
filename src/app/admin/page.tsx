import { createClient } from "@/services/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("user_profile")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome, {profile.name}</p>

        <div className="grid gap-6">
          {/* Profile Submissions Section - Coming Soon */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Profile Submissions</h2>
            <p className="text-sm text-muted-foreground">
              Review and approve user profile submissions
            </p>
            <div className="mt-4 text-center py-8 text-muted-foreground">
              Coming soon
            </div>
          </div>

          {/* User Management Section - Coming Soon */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">User Management</h2>
            <p className="text-sm text-muted-foreground">
              View and manage all users on the platform
            </p>
            <div className="mt-4 text-center py-8 text-muted-foreground">
              Coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
