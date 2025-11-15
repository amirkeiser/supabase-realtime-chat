"use server"

import { createClient } from "@/services/supabase/server"
import { revalidatePath } from "next/cache"

export type PotentialMatch = {
  id: string
  bio: string | null
  location: string | null
  date_of_birth: string | null
  gender: string | null
  religious_info: Record<string, unknown>
  preferences: Record<string, unknown>
  hasExistingRequest: boolean
}

export type ConnectionRequest = {
  id: string
  created_at: string
  sender: {
    id: string
    name: string
    bio: string | null
    location: string | null
    photo_url: string | null
  }
  status: string
}

export type Connection = {
  id: string
  created_at: string
  chat_room_id: string | null
  other_user: {
    id: string
    name: string
    photo_url: string | null
    bio: string | null
    location: string | null
  }
}

/**
 * Get potential matches (approved users excluding already connected/requested)
 */
export async function getPotentialMatches(): Promise<PotentialMatch[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get all approved users except current user
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profile")
    .select(
      "id, bio, location, date_of_birth, gender, religious_info, preferences"
    )
    .eq("profile_status", "approved")
    .neq("id", user.id)

  if (profilesError || !profiles) {
    return []
  }

  // Get existing connection requests (sent or received)
  const { data: existingRequests } = await supabase
    .from("connection_requests")
    .select("sender_id, receiver_id")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

  const requestedUserIds = new Set(
    existingRequests?.flatMap(req => [req.sender_id, req.receiver_id]) || []
  )

  // Get existing connections
  const { data: existingConnections } = await supabase
    .from("connections")
    .select("user1_id, user2_id")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

  const connectedUserIds = new Set(
    existingConnections?.flatMap(conn => [conn.user1_id, conn.user2_id]) || []
  )

  // Filter out users with existing requests or connections
  return profiles
    .filter(
      profile =>
        !requestedUserIds.has(profile.id) && !connectedUserIds.has(profile.id)
    )
    .map(profile => ({
      id: profile.id,
      bio: profile.bio,
      location: profile.location,
      date_of_birth: profile.date_of_birth,
      gender: profile.gender,
      religious_info: (profile.religious_info as Record<string, unknown>) || {},
      preferences: (profile.preferences as Record<string, unknown>) || {},
      hasExistingRequest: false,
    }))
}

/**
 * Get incoming connection requests
 */
export async function getConnectionRequests(): Promise<ConnectionRequest[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("connection_requests")
    .select(
      `
      id,
      created_at,
      status,
      sender:user_profile!connection_requests_sender_id_fkey (
        id,
        name,
        bio,
        location,
        photo_url
      )
    `
    )
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map(request => ({
    id: request.id,
    created_at: request.created_at,
    status: request.status,
    sender: Array.isArray(request.sender)
      ? request.sender[0]
      : (request.sender as ConnectionRequest["sender"]),
  }))
}

/**
 * Get user's connections
 */
export async function getConnections(): Promise<Connection[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("connections")
    .select(
      `
      id,
      created_at,
      chat_room_id,
      user1_id,
      user2_id,
      user1:user_profile!connections_user1_id_fkey (
        id,
        name,
        photo_url,
        bio,
        location
      ),
      user2:user_profile!connections_user2_id_fkey (
        id,
        name,
        photo_url,
        bio,
        location
      )
    `
    )
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map(connection => {
    const otherUser =
      connection.user1_id === user.id ? connection.user2 : connection.user1
    const other = Array.isArray(otherUser) ? otherUser[0] : otherUser

    return {
      id: connection.id,
      created_at: connection.created_at,
      chat_room_id: connection.chat_room_id,
      other_user: {
        id: other.id,
        name: other.name,
        photo_url: other.photo_url,
        bio: other.bio,
        location: other.location,
      },
    }
  })
}

/**
 * Send a connection request
 */
export async function sendConnectionRequest(receiverId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if receiver exists and is approved
  const { data: receiver, error: receiverError } = await supabase
    .from("user_profile")
    .select("id, profile_status")
    .eq("id", receiverId)
    .single()

  if (receiverError || !receiver) {
    throw new Error("User not found")
  }

  if (receiver.profile_status !== "approved") {
    throw new Error("User is not available for connections")
  }

  // Insert connection request
  const { error: insertError } = await supabase
    .from("connection_requests")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
    })

  if (insertError) {
    if (insertError.code === "23505") {
      // Unique constraint violation
      throw new Error("Connection request already exists")
    }
    throw new Error("Failed to send connection request")
  }

  revalidatePath("/")
  return { success: true }
}

/**
 * Accept a connection request
 */
export async function acceptConnectionRequest(requestId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Use the database function to create connection
  const { error } = await supabase.rpc("create_connection", {
    request_id: requestId,
  })

  if (error) {
    throw new Error(error.message || "Failed to accept connection request")
  }

  revalidatePath("/")
  return { success: true }
}

/**
 * Decline a connection request
 */
export async function declineConnectionRequest(requestId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("connection_requests")
    .update({
      status: "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("receiver_id", user.id)

  if (error) {
    throw new Error("Failed to decline connection request")
  }

  revalidatePath("/")
  return { success: true }
}

/**
 * Cancel a sent connection request
 */
export async function cancelConnectionRequest(requestId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("connection_requests")
    .delete()
    .eq("id", requestId)
    .eq("sender_id", user.id)
    .eq("status", "pending")

  if (error) {
    throw new Error("Failed to cancel connection request")
  }

  revalidatePath("/")
  return { success: true }
}

