<script setup lang="ts">
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Expense } from '@/types'
import { BaseEmpty } from '@/components/common'

interface Props {
  expenses: Expense[]
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [expense: Expense]
  delete: [expense: Expense]
}>()

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function formatDate(date: Date): string {
  return format(date, "d 'de' MMM, yyyy", { locale: es })
}
</script>

<template>
  <div>
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-100 rounded-lg h-16" />
    </div>

    <BaseEmpty
      v-else-if="expenses.length === 0"
      title="No hay gastos"
      description="Comienza agregando tu primer gasto"
    />

    <div v-else class="space-y-2">
      <div
        v-for="expense in expenses"
        :key="expense.id"
        class="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
      >
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate">{{ expense.description }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {{ expense.categoryName }}
            </span>
            <span class="text-xs text-gray-500">{{ formatDate(expense.date) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3 ml-4">
          <span class="font-semibold text-red-600">
            -{{ formatCurrency(expense.amount) }}
          </span>

          <div class="flex items-center gap-1">
            <button
              class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              @click="emit('edit', expense)"
            >
              <PencilIcon class="h-4 w-4" />
            </button>
            <button
              class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
              @click="emit('delete', expense)"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
