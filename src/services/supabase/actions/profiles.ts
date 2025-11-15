'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/services/supabase/server'
import type { Json } from '@/services/supabase/types/database'

export type ProfileFormData = {
  photo_url: string
  bio: string
  date_of_birth: string
  gender: 'male' | 'female'
  location: string
  religious_info: Json
  preferences: Json
}

export async function submitProfile(data: ProfileFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('user_profile')
    .update({
      ...data,
      profile_status: 'pending_review',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile/pending')
  return { success: true }
}

export async function updateProfile(data: Partial<ProfileFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('user_profile')
    .update(data)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function approveProfile(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('approve_profile', {
    target_user_id: userId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectProfile(userId: string, reason?: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('reject_profile', {
    target_user_id: userId,
    reason: reason || undefined,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function getPendingProfiles() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profile')
    .select('*')
    .eq('profile_status', 'pending_review')
    .order('submitted_at', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function getCurrentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('user_profile')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

