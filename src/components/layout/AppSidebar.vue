<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import {
  HomeIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  WalletIcon,
  TagIcon,
  ChartBarIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Gastos', to: '/expenses', icon: BanknotesIcon },
  { name: 'Viajes', to: '/trips', icon: MapPinIcon },
  { name: 'Ingresos', to: '/incomes', icon: ArrowTrendingUpIcon },
  { name: 'Cajas de Ahorro', to: '/savings', icon: WalletIcon },
  { name: 'Categorías', to: '/categories', icon: TagIcon },
  { name: 'Reportes', to: '/reports', icon: ChartBarIcon }
]

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <!-- Mobile backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    @click="emit('close')"
  />

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-primary-600">Cashier</h1>
        <button
          class="lg:hidden rounded-lg p-1 text-gray-400 hover:bg-gray-100"
          @click="emit('close')"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          :class="[
            'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive(item.to)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
          @click="emit('close')"
        >
          <component
            :is="item.icon"
            :class="[
              'mr-3 h-5 w-5',
              isActive(item.to) ? 'text-primary-600' : 'text-gray-400'
            ]"
          />
          {{ item.name }}
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>
