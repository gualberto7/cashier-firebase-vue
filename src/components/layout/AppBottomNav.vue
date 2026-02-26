<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import {
  HomeIcon,
  BanknotesIcon,
  WalletIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  WalletIcon as WalletIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/vue/24/solid'

const route = useRoute()

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon, iconActive: HomeIconSolid },
  { name: 'Gastos', to: '/expenses', icon: BanknotesIcon, iconActive: BanknotesIconSolid },
  { name: 'Ahorros', to: '/savings', icon: WalletIcon, iconActive: WalletIconSolid },
  { name: 'Reportes', to: '/reports', icon: ChartBarIcon, iconActive: ChartBarIconSolid }
]

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 lg:hidden">
    <div class="flex items-center justify-around h-16">
      <RouterLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        class="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors"
        :class="isActive(item.to) ? 'text-primary-600' : 'text-gray-400'"
      >
        <component
          :is="isActive(item.to) ? item.iconActive : item.icon"
          class="h-6 w-6"
        />
        <span class="text-[10px] font-medium leading-none">{{ item.name }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
