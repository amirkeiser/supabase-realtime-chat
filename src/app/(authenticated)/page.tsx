import { getCurrentUser } from "@/services/supabase/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { Heart, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Home - Maknoon",
  description: "Connect with like-minded individuals",
}

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <CardTitle>Potential Matches</CardTitle>
              </div>
              <CardDescription>
                Discover people who share your values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/matches">View Matches</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <CardTitle>Connection Requests</CardTitle>
              </div>
              <CardDescription>
                Review and respond to connection requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/requests">View Requests</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <CardTitle>Your Connections</CardTitle>
              </div>
              <CardDescription>
                Chat with people you&apos;ve connected with
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/connections">View Connections</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
