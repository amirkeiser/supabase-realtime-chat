import { createClient } from '../server'

export type UserRole = 'user' | 'admin'

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('user_profile')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data.role as UserRole
}

