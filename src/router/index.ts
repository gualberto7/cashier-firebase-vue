import { createRouter, createWebHistory } from 'vue-router'
import { setupAuthGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: () => import('@/views/ExpensesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/incomes',
      name: 'incomes',
      component: () => import('@/views/IncomesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/savings',
      name: 'savings',
      component: () => import('@/views/SavingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/CategoriesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('@/views/ReportsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/trips',
      name: 'trips',
      component: () => import('@/views/TripsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/trips/:id',
      name: 'trip-detail',
      component: () => import('@/views/TripDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

setupAuthGuard(router)

export default router
