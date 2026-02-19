<script setup lang="ts">
import { ref } from 'vue'
import { Bars3Icon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits<{
  toggleSidebar: []
}>()

const { user, logout } = useAuth()
const showUserMenu = ref(false)

async function handleLogout() {
  showUserMenu.value = false
  await logout()
}
</script>

<template>
  <header class="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-6">
    <!-- Left side -->
    <div class="flex items-center">
      <button
        class="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        @click="emit('toggleSidebar')"
      >
        <Bars3Icon class="h-6 w-6" />
      </button>
    </div>

    <!-- Right side -->
    <div class="relative">
      <button
        class="flex items-center space-x-2 rounded-lg p-2 text-gray-700 hover:bg-gray-100"
        @click="showUserMenu = !showUserMenu"
      >
        <UserCircleIcon class="h-6 w-6" />
        <span class="hidden sm:inline text-sm font-medium">
          {{ user?.displayName || user?.email || 'Usuario' }}
        </span>
      </button>

      <!-- Dropdown menu -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="showUserMenu"
          class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
        >
          <div class="py-1">
            <div class="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
              {{ user?.email }}
            </div>
            <button
              class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="handleLogout"
            >
              <ArrowRightOnRectangleIcon class="mr-2 h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </Transition>

      <!-- Click outside to close -->
      <div
        v-if="showUserMenu"
        class="fixed inset-0 z-[-1]"
        @click="showUserMenu = false"
      />
    </div>
  </header>
</template>
