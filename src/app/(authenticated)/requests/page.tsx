import { getConnectionRequests } from "@/services/supabase/actions/connections"
import { getCurrentUser } from "@/services/supabase/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { ConnectionRequestsTab } from "../_components/connection-requests-tab"
import { Suspense } from "react"

export default async function RequestsPage() {
  const user = await getCurrentUser()
  if (user == null) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Connection Requests</h1>
          <p className="text-muted-foreground">
            Review and respond to connection requests
          </p>
        </div>

        <Suspense fallback={<div>Loading requests...</div>}>
          <RequestsSection />
        </Suspense>
      </div>
    </div>
  )
}

async function RequestsSection() {
  const requests = await getConnectionRequests()
  return <ConnectionRequestsTab requests={requests} />
}

