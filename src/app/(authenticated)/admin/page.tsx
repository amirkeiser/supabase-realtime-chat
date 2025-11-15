import { createClient } from "@/services/supabase/server";
import { redirect } from "next/navigation";
import { getPendingProfiles } from "@/services/supabase/actions/profiles";
import { Card } from "@/components/ui/card";
import AdminReviewActions from "./_components/admin-review-actions";
import { Metadata } from "next"

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
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
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
              <div className="space-y-6">
                {pendingProfiles.map((profileData) => (
                  <Card key={profileData.id} className="p-6">
                    <div className="flex gap-6">
                      {/* Profile Photo */}
                      {profileData.photo_url && (
                        <div className="shrink-0">
                          <img
                            src={profileData.photo_url}
                            alt="Profile"
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        </div>
                      )}

                      {/* Profile Details */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {profileData.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {profileData.gender} • {profileData.location}
                            {profileData.date_of_birth &&
                              ` • ${
                                new Date().getFullYear() -
                                new Date(
                                  profileData.date_of_birth
                                ).getFullYear()
                              } years old`}
                          </p>
                        </div>

                        {/* Bio */}
                        {profileData.bio && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Bio:</h4>
                            <p className="text-sm">{profileData.bio}</p>
                          </div>
                        )}

                        {/* Religious Info */}
                        {profileData.religious_info && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">
                              Religious Information:
                            </h4>
                            <div className="text-sm space-y-1">
                              {Object.entries(
                                profileData.religious_info as Record<
                                  string,
                                  unknown
                                >
                              ).map(([key, value]) => (
                                <p key={key}>
                                  <span className="text-muted-foreground capitalize">
                                    {key.replace(/_/g, " ")}:
                                  </span>{" "}
                                  {String(value)}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Preferences */}
                        {profileData.preferences && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">
                              Preferences:
                            </h4>
                            <div className="text-sm space-y-1">
                              {Object.entries(
                                profileData.preferences as Record<
                                  string,
                                  unknown
                                >
                              ).map(([key, value]) => (
                                <p key={key}>
                                  <span className="text-muted-foreground capitalize">
                                    {key.replace(/_/g, " ")}:
                                  </span>{" "}
                                  {String(value)}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Submitted:{" "}
                          {profileData.submitted_at
                            ? new Date(
                                profileData.submitted_at
                              ).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <AdminReviewActions userId={profileData.id} />
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
