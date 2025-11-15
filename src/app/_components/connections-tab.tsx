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
import { Button } from "@/components/ui/button"
import { Connection } from "@/services/supabase/actions/connections"
import { UsersIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function ConnectionsTab({ connections }: { connections: Connection[] }) {
  if (connections.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>No Connections Yet</EmptyTitle>
          <EmptyDescription>
            Accept connection requests to start chatting with matches
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
      {connections.map(connection => (
        <ConnectionCard key={connection.id} connection={connection} />
      ))}
    </div>
  )
}

function ConnectionCard({ connection }: { connection: Connection }) {
  const connectedDate = new Date(connection.created_at).toLocaleDateString()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {connection.other_user.photo_url ? (
            <Image
              src={connection.other_user.photo_url}
              alt={connection.other_user.name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <CardTitle>{connection.other_user.name}</CardTitle>
            <CardDescription>Connected on {connectedDate}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {connection.other_user.bio && (
          <div>
            <p className="text-sm font-medium">Bio</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {connection.other_user.bio}
            </p>
          </div>
        )}
        {connection.other_user.location && (
          <div>
            <p className="text-sm font-medium">Location</p>
            <p className="text-sm text-muted-foreground">
              {connection.other_user.location}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {connection.chat_room_id ? (
          <Button asChild className="w-full">
            <Link href={`/rooms/${connection.chat_room_id}`}>Open Chat</Link>
          </Button>
        ) : (
          <Button disabled className="w-full">
            Chat Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

