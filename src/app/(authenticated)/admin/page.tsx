import { createClient } from "@/services/supabase/server";
import { redirect } from "next/navigation";
import { getPendingProfiles } from "@/services/supabase/actions/profiles";
import { Card } from "@/components/ui/card";
import ExpandableProfileRow from "./_components/expandable-profile-row";
import { Metadata } from "next"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin - Maknoon",
  description: "Admin dashboard",
}

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

  // Get pending profiles
  const { data: pendingProfiles } = await getPendingProfiles();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button asChild>
            <Link href="/admin/test-chat">Test Chat</Link>
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">Welcome, {profile.name}</p>

        <div className="grid gap-6">
          {/* Stats */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </h3>
            <p className="text-2xl font-bold mt-1">
              {pendingProfiles?.length || 0}
            </p>
          </Card>

          {/* Profile Submissions Section */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Submissions</h2>

            {!pendingProfiles || pendingProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending profiles to review
              </div>
            ) : (
              <div className="space-y-2">
                {pendingProfiles.map((profileData) => (
                  <ExpandableProfileRow
                    key={profileData.id}
                    profileData={profileData}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
