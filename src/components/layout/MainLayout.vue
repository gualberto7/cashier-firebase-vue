<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppBottomNav from './AppBottomNav.vue'

const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <AppSidebar :is-open="sidebarOpen" @close="closeSidebar" />

    <div class="flex-1 flex flex-col min-w-0">
      <AppHeader @toggle-sidebar="toggleSidebar" />

      <main class="flex-1 p-4 pb-20 lg:p-6 lg:pb-6">
        <slot />
      </main>
    </div>

    <AppBottomNav />
  </div>
</template>
