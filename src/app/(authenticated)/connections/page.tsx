import { getConnections } from "@/services/supabase/actions/connections"
import { getCurrentUser } from "@/services/supabase/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { ConnectionsTab } from "../_components/connections-tab"
import { Suspense } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Connections - Maknoon",
  description: "Your active connections",
}

export default async function ConnectionsPage() {
  const user = await getCurrentUser()
  if (user == null) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your Connections</h1>
          <p className="text-muted-foreground">
            Chat with people you&apos;ve connected with
          </p>
        </div>

        <Suspense fallback={<div>Loading connections...</div>}>
          <ConnectionsSection />
        </Suspense>
      </div>
    </div>
  )
}

async function ConnectionsSection() {
  const connections = await getConnections()
  return <ConnectionsTab connections={connections} />
}

