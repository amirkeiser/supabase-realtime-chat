"use client"

import { ActionButton } from "@/components/ui/action-button"
import { acceptConnectionRequest } from "@/services/supabase/actions/connections"
import { CheckIcon } from "lucide-react"
import { toast } from "sonner"

export function AcceptRequestButton({
  requestId,
  className,
}: {
  requestId: string
  className?: string
}) {
  async function handleAccept() {
    try {
      await acceptConnectionRequest(requestId)
      toast.success("Connection accepted! You can now chat.")
      return { error: false }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to accept request"
      toast.error(message)
      return { error: true, message }
    }
  }

  return (
    <ActionButton action={handleAccept} className={className} variant="default">
      <CheckIcon className="w-4 h-4 mr-2" />
      Accept
    </ActionButton>
  )
}

