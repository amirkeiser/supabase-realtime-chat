"use client"

import { ActionButton } from "@/components/ui/action-button"
import { sendConnectionRequest } from "@/services/supabase/actions/connections"
import { HeartIcon } from "lucide-react"
import { toast } from "sonner"

export function SendRequestButton({
  userId,
  className,
}: {
  userId: string
  className?: string
}) {
  async function handleSendRequest() {
    try {
      await sendConnectionRequest(userId)
      toast.success("Connection request sent")
      return { error: false }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send request"
      toast.error(message)
      return { error: true, message }
    }
  }

  return (
    <ActionButton
      action={handleSendRequest}
      className={className}
      variant="default"
    >
      <HeartIcon className="w-4 h-4 mr-2" />
      Send Request
    </ActionButton>
  )
}

