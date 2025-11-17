"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  getCurrentProfile,
  type ProfileFormData,
} from "@/services/supabase/actions/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { useCurrentUser } from "@/services/supabase/hooks/useCurrentUser";
import { createClient } from "@/services/supabase/client";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    bio?: string | null;
    date_of_birth?: string | null;
    gender?: "male" | "female" | null;
    location?: string | null;
  }>({
    bio: "",
    date_of_birth: "",
    gender: undefined,
    location: "",
  });

  // Setup dropzone for photo upload
  const dropzoneProps = useSupabaseUpload({
    bucketName: "profile-photos",
    path: user?.id, // Upload to user's folder
    allowedMimeTypes: ["image/*"],
    maxFiles: 1,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      setLoadingProfile(true);
      const result = await getCurrentProfile();

      if (result.error) {
        setError(result.error);
        setLoadingProfile(false);
        return;
      }

      if (result.data) {
        setFormData({
          bio: result.data.bio ?? "",
          date_of_birth: result.data.date_of_birth ?? "",
          gender: result.data.gender ?? undefined,
          location: result.data.location ?? "",
        });
        setExistingPhotoUrl(result.data.photo_url ?? null);
      }

      setLoadingProfile(false);
    };

    loadProfile();
  }, [user?.id]);

  // Check for existing photo on mount
  useEffect(() => {
    const checkExistingPhoto = async () => {
      if (!user?.id || existingPhotoUrl) return;

      const supabase = createClient();

      // List files in user's folder
      const { data: files, error: listError } = await supabase.storage
        .from("profile-photos")
        .list(user.id, {
          limit: 1,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (listError || !files || files.length === 0) {
        return;
      }

      // Get the public URL for the most recent file
      const fileName = files[0].name;
      const filePath = `${user.id}/${fileName}`;
      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      setExistingPhotoUrl(urlData.publicUrl);
    };

    checkExistingPhoto();
  }, [user?.id, existingPhotoUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let photoUrl = existingPhotoUrl;

    // If user added a new photo, upload it
    if (dropzoneProps.files.length > 0 && !dropzoneProps.isSuccess) {
      await dropzoneProps.onUpload();

      // After upload, get the new photo URL
      const supabase = createClient();
      const uploadedFile = dropzoneProps.files[0];
      const filePath = `${user?.id}/${uploadedFile.name}`;

      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      photoUrl = urlData.publicUrl;
    }

    // If a new photo was uploaded successfully, use that URL
    if (dropzoneProps.isSuccess && dropzoneProps.files.length > 0) {
      const supabase = createClient();
      const uploadedFile = dropzoneProps.files[0];
      const filePath = `${user?.id}/${uploadedFile.name}`;

      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      photoUrl = urlData.publicUrl;
    }

    const updateData: Partial<ProfileFormData> = {
      bio: formData.bio || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      location: formData.location || null,
    };

    if (photoUrl) {
      updateData.photo_url = photoUrl;
    }

    const result = await updateProfile(updateData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      toast.error("Failed to update profile");
    } else {
      setLoading(false);
      toast.success("Profile updated successfully");
      // Refresh the page to show updated data
      router.refresh();
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            View and update your profile information
          </p>
        </div>

        <Card className="p-6 border-0 shadow-none">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload */}
            <Field>
              <FieldLabel>Profile Photo</FieldLabel>
              <FieldDescription>
                {existingPhotoUrl
                  ? "You have an existing photo. Upload a new one to replace it."
                  : "Upload a clear photo of yourself (max 5MB)"}
              </FieldDescription>

              {existingPhotoUrl && dropzoneProps.files.length === 0 && (
                <div className="mt-2 mb-4">
                  <div className="border-2 border-solid border-primary rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center gap-4">
                      <img
                        src={existingPhotoUrl}
                        alt="Current profile photo"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary">
                          Current photo uploaded
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a new photo below to replace it
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Dropzone {...dropzoneProps} className="mt-2">
                <DropzoneEmptyState />
                <DropzoneContent />
              </Dropzone>
            </Field>

            {/* Bio */}
            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <FieldDescription>Tell us about yourself</FieldDescription>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
                placeholder="Write a brief introduction about yourself..."
              />
            </Field>

            {/* Date of Birth */}
            <Field>
              <FieldLabel htmlFor="date_of_birth">Date of Birth</FieldLabel>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
              />
            </Field>

            {/* Gender */}
            <Field>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as "male" | "female",
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>

            {/* Location */}
            <Field>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="City, Country"
              />
            </Field>

            {/* Religious Information - Placeholder */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold">Religious Information</h2>

              <Field>
                <FieldDescription>
                  This is where we can potentially ask religious info, if we
                  choose to.
                </FieldDescription>
              </Field>
            </div>

            {/* Matchmaking Preferences - Placeholder */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold">Matchmaking Preferences</h2>

              <Field>
                <FieldDescription>
                  This is where we can potentially ask matchmaking preferences,
                  if we choose to.
                </FieldDescription>
              </Field>
            </div>

            {error && <FieldError>{error}</FieldError>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
