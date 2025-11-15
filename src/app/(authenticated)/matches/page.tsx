import { getPotentialMatches } from "@/services/supabase/actions/connections"
import { getCurrentUser } from "@/services/supabase/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { PotentialMatchesTab } from "../_components/potential-matches-tab"
import { Suspense } from "react"

export default async function MatchesPage() {
  const user = await getCurrentUser()
  if (user == null) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Potential Matches</h1>
          <p className="text-muted-foreground">
            Discover people who share your values
          </p>
        </div>

        <Suspense fallback={<div>Loading matches...</div>}>
          <MatchesSection />
        </Suspense>
      </div>
    </div>
  )
}

async function MatchesSection() {
  const matches = await getPotentialMatches()
  return <PotentialMatchesTab matches={matches} />
}

