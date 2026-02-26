import { supabase } from '@/config/supabase'
import type { UserProfile } from '@/types'

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async register(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    })
    if (error) throw error

    if (data.user) {
      await this.createUserProfile(data.user.id)
    }

    return data
  },

  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async createUserProfile(userId: string, profile?: Partial<UserProfile>) {
    const defaultProfile: UserProfile = {
      currency: 'BOB',
      locale: 'es-BO',
      ...profile
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...defaultProfile })

    if (error) throw error
    return defaultProfile
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('currency, locale')
      .eq('id', userId)
      .single()

    if (error) return null
    return data as UserProfile
  },

  async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', userId)

    if (error) throw error
  },

  getCurrentUser() {
    return supabase.auth.getUser()
  }
}
