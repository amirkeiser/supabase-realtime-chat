import { getCurrentUser } from "@/services/supabase/lib/getCurrentUser"
import { createAdminClient } from "@/services/supabase/server"
import { redirect } from "next/navigation"
import { RoomClient } from "../../rooms/[id]/_client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Test Chat - Maknoon",
  description: "Test chat functionality",
}

export default async function AdminTestChatPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createAdminClient()

  // Verify admin role
  const { data: profile } = await supabase
    .from("user_profile")
    .select("role, name, image_url")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  // Get or create test room
  const testRoom = await getOrCreateTestRoom(user.id)
  
  if (!testRoom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground">Failed to create test room</p>
        </div>
      </div>
    )
  }

  // Get messages
  const messages = await getMessages(testRoom.id)

  return (
    <RoomClient
      room={{ id: testRoom.id, name: testRoom.name }}
      user={{
        id: user.id,
        name: profile.name,
        image_url: profile.image_url,
      }}
      messages={messages}
    />
  )
}

async function getOrCreateTestRoom(userId: string) {
  const supabase = await createAdminClient()

  // Try to find existing test room
  const { data: existingRoom } = await supabase
    .from("chat_room")
    .select("id, name, chat_room_member!inner ()")
    .eq("name", "Admin Test Chat")
    .eq("chat_room_member.member_id", userId)
    .maybeSingle()

  if (existingRoom) {
    return existingRoom
  }

  // Create new test room
  const { data: newRoom, error: roomError } = await supabase
    .from("chat_room")
    .insert({ name: "Admin Test Chat", is_public: false })
    .select("id, name")
    .single()

  if (roomError || !newRoom) {
    console.error("Failed to create test room:", roomError)
    return null
  }

  // Add admin as member
  const { error: memberError } = await supabase
    .from("chat_room_member")
    .insert({ chat_room_id: newRoom.id, member_id: userId })

  if (memberError) {
    console.error("Failed to add admin to test room:", memberError)
    return null
  }

  return newRoom
}

async function getMessages(roomId: string) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("message")
    .select(
      "id, text, created_at, author_id, author:user_profile (name, image_url)"
    )
    .eq("chat_room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) return []
  return data
}

