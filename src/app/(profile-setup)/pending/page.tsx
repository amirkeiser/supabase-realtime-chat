import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/services/supabase/actions/profiles'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Metadata } from 'next'
import { ProfileStatusMonitor } from './_components/profile-status-monitor'

export const metadata: Metadata = {
  title: "Profile Pending - Maknoon",
  description: "Your profile is under review",
}

export default async function ProfilePendingPage() {
  const { data: profile, error } = await getCurrentProfile()

  if (error || !profile) {
    redirect('/auth/login')
  }

  return (
    <div className="flex items-center justify-center pt-16 pb-8 px-4">
      <ProfileStatusMonitor userId={profile.id} />
      <div className="w-full max-w-2xl">
        <Card className="p-8 text-center space-y-4 border-0 shadow-none">
        <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-yellow-600 dark:text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">Profile Under Review</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your profile has been submitted and is currently being reviewed by our team. 
          You&apos;ll be notified once it has been approved.
        </p>

        {profile.submitted_at && (
          <p className="text-sm text-muted-foreground">
            Submitted on {new Date(profile.submitted_at).toLocaleDateString()}
          </p>
        )}

        <div className="pt-4">
          <Button asChild variant="outline">
            <Link href="/auth/login">Logout</Link>
          </Button>
        </div>
      </Card>
      </div>
    </div>
  )
}

