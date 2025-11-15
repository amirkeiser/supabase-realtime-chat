import {
  getConnections,
  getConnectionRequests,
  getPotentialMatches,
} from "@/services/supabase/actions/connections"
import { getCurrentUser } from "@/services/supabase/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { ConnectionsTab } from "./_components/connections-tab"
import { ConnectionRequestsTab } from "./_components/connection-requests-tab"
import { PotentialMatchesTab } from "./_components/potential-matches-tab"
import { Suspense } from "react"

export default async function Home() {
  const user = await getCurrentUser()
  if (user == null) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Maknoon</h1>
          <p className="text-muted-foreground">
            Connect with like-minded individuals
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Potential Matches</h2>
            <Suspense fallback={<div>Loading matches...</div>}>
              <MatchesSection />
            </Suspense>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Connection Requests
            </h2>
            <Suspense fallback={<div>Loading requests...</div>}>
              <RequestsSection />
            </Suspense>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Connections</h2>
            <Suspense fallback={<div>Loading connections...</div>}>
              <ConnectionsSection />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  )
}

async function MatchesSection() {
  const matches = await getPotentialMatches()
  return <PotentialMatchesTab matches={matches} />
}

async function RequestsSection() {
  const requests = await getConnectionRequests()
  return <ConnectionRequestsTab requests={requests} />
}

async function ConnectionsSection() {
  const connections = await getConnections()
  return <ConnectionsTab connections={connections} />
}
