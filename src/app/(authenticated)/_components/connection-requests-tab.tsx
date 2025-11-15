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
import { ConnectionRequest } from "@/services/supabase/actions/connections"
import { UserIcon } from "lucide-react"
import { AcceptRequestButton } from "./accept-request-button"
import { DeclineRequestButton } from "./decline-request-button"

export function ConnectionRequestsTab({
  requests,
}: {
  requests: ConnectionRequest[]
}) {
  if (requests.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserIcon />
          </EmptyMedia>
          <EmptyTitle>No Connection Requests</EmptyTitle>
          <EmptyDescription>
            You don&apos;t have any pending connection requests
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
      {requests.map(request => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  )
}

function RequestCard({ request }: { request: ConnectionRequest }) {
  const createdDate = new Date(request.created_at).toLocaleDateString()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground">
          Connection Request
        </CardTitle>
        <CardDescription>Received on {createdDate}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Someone is interested in connecting with you. Accept to reveal their
          identity and start chatting.
        </p>
        {request.sender.bio && (
          <div>
            <p className="text-sm font-medium">Bio</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {request.sender.bio}
            </p>
          </div>
        )}
        {request.sender.location && (
          <div>
            <p className="text-sm font-medium">Location</p>
            <p className="text-sm text-muted-foreground">
              {request.sender.location}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <AcceptRequestButton requestId={request.id} className="flex-1" />
        <DeclineRequestButton requestId={request.id} className="flex-1" />
      </CardFooter>
    </Card>
  )
}

