'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveProfile, rejectProfile } from '@/services/supabase/actions/profiles'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel } from '@/components/ui/field'

export default function AdminReviewActions({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleApprove = async () => {
    setLoading(true)
    const result = await approveProfile(userId)
    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setLoading(true)
    const result = await rejectProfile(userId, rejectionReason)
    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  if (showRejectForm) {
    return (
      <div className="mt-4 space-y-4 border-t pt-4">
        <Field>
          <FieldLabel>Rejection Reason</FieldLabel>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this profile is being rejected..."
            rows={3}
          />
        </Field>
        <div className="flex gap-2">
          <Button
            onClick={handleReject}
            disabled={loading}
            variant="destructive"
            size="sm"
          >
            {loading ? 'Rejecting...' : 'Confirm Reject'}
          </Button>
          <Button
            onClick={() => setShowRejectForm(false)}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 mt-4 border-t pt-4">
      <Button
        onClick={handleApprove}
        disabled={loading}
        size="sm"
      >
        Approve
      </Button>
      <Button
        onClick={() => setShowRejectForm(true)}
        disabled={loading}
        variant="destructive"
        size="sm"
      >
        Reject
      </Button>
    </div>
  )
}

