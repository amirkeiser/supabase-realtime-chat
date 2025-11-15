import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/services/supabase/actions/profiles'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Profile Rejected - Maknoon",
  description: "Profile review status",
}

export default async function ProfileRejectedPage() {
  const { data: profile, error } = await getCurrentProfile()

  if (error || !profile) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8 space-y-4">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-600 dark:text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Profile Not Approved</h1>
          <p className="text-muted-foreground mt-2">
            Unfortunately, your profile was not approved at this time.
          </p>
        </div>

        {profile.rejection_reason && (
          <Card className="p-4 bg-muted">
            <h2 className="font-semibold mb-2">Reason:</h2>
            <p className="text-sm">{profile.rejection_reason}</p>
          </Card>
        )}

        <p className="text-sm text-muted-foreground text-center">
          You can edit your profile and resubmit it for review.
        </p>

        <div className="flex gap-3 justify-center pt-4">
          <Button asChild>
            <Link href="/profile/setup">Edit & Resubmit Profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/login">Logout</Link>
          </Button>
        </div>
      </Card>
      </div>
    </div>
  )
}

