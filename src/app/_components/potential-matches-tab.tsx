import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PotentialMatch } from "@/services/supabase/actions/connections"
import { HeartIcon } from "lucide-react"
import { SendRequestButton } from "./send-request-button"

export function PotentialMatchesTab({
  matches,
}: {
  matches: PotentialMatch[]
}) {
  if (matches.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HeartIcon />
          </EmptyMedia>
          <EmptyTitle>No Potential Matches</EmptyTitle>
          <EmptyDescription>
            Check back later for new potential matches
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
      {matches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}

function MatchCard({ match }: { match: PotentialMatch }) {
  const age = match.date_of_birth
    ? new Date().getFullYear() - new Date(match.date_of_birth).getFullYear()
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground">Anonymous User</CardTitle>
        <CardDescription>
          {age && `${age} years old`}
          {age && match.location && " • "}
          {match.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {match.bio && (
          <div>
            <p className="text-sm font-medium">Bio</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {match.bio}
            </p>
          </div>
        )}
        {match.religious_info &&
          Object.keys(match.religious_info).length > 0 && (
            <div>
              <p className="text-sm font-medium">Religious Background</p>
              <div className="text-sm text-muted-foreground space-y-1">
                {Object.entries(match.religious_info).map(([key, value]) => (
                  <p key={key}>
                    <span className="font-medium">{formatKey(key)}:</span>{" "}
                    {String(value)}
                  </p>
                ))}
              </div>
            </div>
          )}
      </CardContent>
      <CardFooter>
        <SendRequestButton userId={match.id} className="w-full" />
      </CardFooter>
    </Card>
  )
}

function formatKey(key: string): string {
  return key
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

