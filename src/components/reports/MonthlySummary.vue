<script setup lang="ts">
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon
} from '@heroicons/vue/24/outline'

interface Props {
  incomes: number
  expenses: number
  balance: number
}

defineProps<Props>()

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Incomes -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-green-100 rounded-lg">
          <ArrowTrendingUpIcon class="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Ingresos</p>
          <p class="text-xl font-bold text-green-600">{{ formatCurrency(incomes) }}</p>
        </div>
      </div>
    </div>

    <!-- Expenses -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-red-100 rounded-lg">
          <ArrowTrendingDownIcon class="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Gastos</p>
          <p class="text-xl font-bold text-red-600">{{ formatCurrency(expenses) }}</p>
        </div>
      </div>
    </div>

    <!-- Balance -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary-100 rounded-lg">
          <ScaleIcon class="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Balance</p>
          <p
            class="text-xl font-bold"
            :class="balance >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ formatCurrency(balance) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
