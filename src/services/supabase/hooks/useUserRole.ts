'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../client'
import type { UserRole } from '../lib/getUserRole'

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('user_profile')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(data?.role as UserRole || null)
      setLoading(false)
    }

    fetchRole()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { role, isAdmin: role === 'admin', loading }
}

