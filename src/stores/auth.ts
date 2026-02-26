import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'
import type { User } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  function setUser(supabaseUser: SupabaseUser | null) {
    if (supabaseUser) {
      user.value = {
        uid: supabaseUser.id,
        email: supabaseUser.email ?? null,
        displayName:
          supabaseUser.user_metadata?.full_name ??
          supabaseUser.user_metadata?.display_name ??
          null,
        photoURL: supabaseUser.user_metadata?.avatar_url ?? null
      }
    } else {
      user.value = null
    }
  }

  async function initializeAuth(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    isInitialized.value = true

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }

  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      setUser(data.user)
    } catch (e: any) {
      error.value = getErrorMessage(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function register(email: string, password: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError
      setUser(data.user)
    } catch (e: any) {
      error.value = getErrorMessage(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithGoogle(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      if (authError) throw authError
    } catch (e: any) {
      error.value = getErrorMessage(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
      user.value = null
    } catch (e: any) {
      error.value = getErrorMessage(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function getErrorMessage(message: string): string {
    const lower = message.toLowerCase()
    if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
      return 'Credenciales inválidas'
    }
    if (lower.includes('email already registered') || lower.includes('user already registered')) {
      return 'Este correo ya está registrado'
    }
    if (lower.includes('password should be')) {
      return 'La contraseña es muy débil'
    }
    if (lower.includes('invalid email')) {
      return 'Correo electrónico inválido'
    }
    if (lower.includes('email not confirmed')) {
      return 'Por favor confirma tu correo electrónico'
    }
    if (lower.includes('too many requests') || lower.includes('rate limit')) {
      return 'Demasiados intentos. Intenta más tarde'
    }
    return 'Ha ocurrido un error'
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    isInitialized,
    isLoading,
    error,
    isAuthenticated,
    initializeAuth,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError
  }
})
