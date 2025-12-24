"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  submitProfile,
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

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);

  // Setup dropzone for photo upload
  const dropzoneProps = useSupabaseUpload({
    bucketName: "profile-photos",
    path: user?.id, // Upload to user's folder
    allowedMimeTypes: ["image/*"],
    maxFiles: 1,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  // Check for existing photo on mount
  useEffect(() => {
    const checkExistingPhoto = async () => {
      if (!user?.id) return;

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
  }, [user?.id]);

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

    // Photo is optional now, so we don't need to check for it

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

    // Get form element and extract values directly
    const form = e.target as HTMLFormElement;
    const formElements = form.elements as any;

    const data: ProfileFormData = {
      photo_url: photoUrl || null,
      bio: formElements.bio?.value || null,
      date_of_birth: formElements.date_of_birth?.value || null,
      gender: formElements.gender?.value || null,
      location: formElements.location?.value || null,
      religious_info: {},
      preferences: {},
    };

    const result = await submitProfile(data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/pending");
    }
  };

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Please fill out all required information. Your profile will be
            reviewed by our team before you can access the platform.
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
                rows={4}
                placeholder="Write a brief introduction about yourself..."
              />
            </Field>

            {/* Date of Birth */}
            <Field>
              <FieldLabel htmlFor="date_of_birth">Date of Birth</FieldLabel>
              <Input id="date_of_birth" name="date_of_birth" type="date" />
            </Field>

            {/* Gender */}
            <Field>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <select
                id="gender"
                name="gender"
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
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
