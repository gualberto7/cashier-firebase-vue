import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function setupAuthGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // Wait for auth initialization
    if (!authStore.isInitialized) {
      await authStore.initializeAuth()
    }

    const requiresAuth = to.meta.requiresAuth
    const requiresGuest = to.meta.requiresGuest
    const isAuthenticated = authStore.isAuthenticated

    if (requiresAuth && !isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else if (requiresGuest && isAuthenticated) {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  })
}
