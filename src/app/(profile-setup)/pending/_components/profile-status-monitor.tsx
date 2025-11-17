'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/services/supabase/client'
import { toast } from 'sonner'

export function ProfileStatusMonitor({ userId }: { userId: string }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to profile status changes
    const channel = supabase
      .channel(`profile-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profile',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const newStatus = payload.new.profile_status
          
          if (newStatus === 'approved') {
            toast.success('Your profile has been approved! Redirecting...')
            setTimeout(() => {
              router.push('/')
              router.refresh()
            }, 1500)
          } else if (newStatus === 'rejected') {
            toast.error('Your profile was not approved. Please review the feedback.')
            setTimeout(() => {
              router.push('/rejected')
              router.refresh()
            }, 1500)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, router])

  return null
}

