"use client";

import { useState } from "react";
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

export default function ProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data: ProfileFormData = {
      photo_url: formData.get("photo_url") as string,
      bio: formData.get("bio") as string,
      date_of_birth: formData.get("date_of_birth") as string,
      gender: formData.get("gender") as "male" | "female",
      location: formData.get("location") as string,
      religious_info: {
        prayer_frequency: formData.get("prayer_frequency") as string,
        sect: formData.get("sect") as string,
        hijab_preference: formData.get("hijab_preference") as string,
      },
      preferences: {
        age_min: Number(formData.get("age_min")),
        age_max: Number(formData.get("age_max")),
        location_preference: formData.get("location_preference") as string,
      },
    };

    const result = await submitProfile(data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/profile/pending");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Please fill out all required information. Your profile will be
            reviewed by our team before you can access the platform.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo URL */}
            <Field>
              <FieldLabel htmlFor="photo_url">Profile Photo URL *</FieldLabel>
              <FieldDescription>
                Enter the URL of your profile photo
              </FieldDescription>
              <Input
                id="photo_url"
                name="photo_url"
                type="url"
                required
                placeholder="https://example.com/photo.jpg"
              />
            </Field>

            {/* Bio */}
            <Field>
              <FieldLabel htmlFor="bio">Bio *</FieldLabel>
              <FieldDescription>
                Tell us about yourself (minimum 50 characters)
              </FieldDescription>
              <Textarea
                id="bio"
                name="bio"
                required
                minLength={50}
                rows={4}
                placeholder="Write a brief introduction about yourself..."
              />
            </Field>

            {/* Date of Birth */}
            <Field>
              <FieldLabel htmlFor="date_of_birth">Date of Birth *</FieldLabel>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                required
              />
            </Field>

            {/* Gender */}
            <Field>
              <FieldLabel htmlFor="gender">Gender *</FieldLabel>
              <select
                id="gender"
                name="gender"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>

            {/* Location */}
            <Field>
              <FieldLabel htmlFor="location">Location *</FieldLabel>
              <Input
                id="location"
                name="location"
                type="text"
                required
                placeholder="City, Country"
              />
            </Field>

            {/* Religious Questions */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold">Religious Information</h2>

              <Field>
                <FieldLabel htmlFor="prayer_frequency">
                  Prayer Frequency *
                </FieldLabel>
                <select
                  id="prayer_frequency"
                  name="prayer_frequency"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="">Select frequency</option>
                  <option value="5_times_daily">5 times daily</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="rarely">Rarely</option>
                </select>
              </Field>

              <Field>
                <FieldLabel htmlFor="sect">Sect *</FieldLabel>
                <select
                  id="sect"
                  name="sect"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="">Select sect</option>
                  <option value="twelver">Twelver</option>
                  <option value="ismaili">Ismaili</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field>
                <FieldLabel htmlFor="hijab_preference">
                  Hijab Preference *
                </FieldLabel>
                <select
                  id="hijab_preference"
                  name="hijab_preference"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="">Select preference</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="sometimes">Sometimes</option>
                </select>
              </Field>
            </div>

            {/* Matchmaking Preferences */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold">Matchmaking Preferences</h2>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="age_min">Min Age *</FieldLabel>
                  <Input
                    id="age_min"
                    name="age_min"
                    type="number"
                    required
                    min="18"
                    max="100"
                    placeholder="25"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="age_max">Max Age *</FieldLabel>
                  <Input
                    id="age_max"
                    name="age_max"
                    type="number"
                    required
                    min="18"
                    max="100"
                    placeholder="35"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="location_preference">
                  Location Preference *
                </FieldLabel>
                <Input
                  id="location_preference"
                  name="location_preference"
                  type="text"
                  required
                  placeholder="New York, London, etc."
                />
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
