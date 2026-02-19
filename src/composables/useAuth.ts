import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  async function login(email: string, password: string) {
    await authStore.login(email, password)
    router.push('/')
  }

  async function register(email: string, password: string) {
    await authStore.register(email, password)
    router.push('/')
  }

  async function loginWithGoogle() {
    await authStore.loginWithGoogle()
    router.push('/')
  }

  async function logout() {
    await authStore.logout()
    router.push('/login')
  }

  function clearError() {
    authStore.clearError()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError
  }
}
