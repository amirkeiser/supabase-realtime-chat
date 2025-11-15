"use client"

import { ActionButton } from "@/components/ui/action-button"
import { declineConnectionRequest } from "@/services/supabase/actions/connections"
import { XIcon } from "lucide-react"
import { toast } from "sonner"

export function DeclineRequestButton({
  requestId,
  className,
}: {
  requestId: string
  className?: string
}) {
  async function handleDecline() {
    try {
      await declineConnectionRequest(requestId)
      toast.success("Connection request declined")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to decline request"
      )
    }
  }

  return (
    <ActionButton
      action={handleDecline}
      className={className}
      variant="destructive"
    >
      <XIcon className="w-4 h-4 mr-2" />
      Decline
    </ActionButton>
  )
}

