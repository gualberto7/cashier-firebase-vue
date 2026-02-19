<script setup lang="ts">
import { onMounted } from 'vue'
import { MainLayout } from '@/components/layout'
import { BaseButton, BaseCard } from '@/components/common'
import { ExpensesByCategory, MonthlySummary } from '@/components/reports'
import { useReports } from '@/composables/useReports'
import { useSavingsBoxesStore } from '@/stores/savingsBoxes'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/currency'

const {
  isLoading,
  monthlyExpenses,
  monthlyIncomes,
  monthlyBalance,
  formattedMonth,
  categoryChartData,
  loadMonthlyReport,
  previousMonth,
  nextMonth
} = useReports()

const savingsBoxesStore = useSavingsBoxesStore()

onMounted(async () => {
  await savingsBoxesStore.fetchBoxes()
  await loadMonthlyReport()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
        <p class="text-gray-500">Análisis de tus finanzas</p>
      </div>

      <!-- Month Selector -->
      <div class="flex items-center justify-center gap-4">
        <BaseButton variant="ghost" size="sm" @click="previousMonth">
          <ChevronLeftIcon class="h-5 w-5" />
        </BaseButton>
        <span class="text-lg font-semibold text-gray-900 capitalize min-w-[180px] text-center">
          {{ formattedMonth }}
        </span>
        <BaseButton variant="ghost" size="sm" @click="nextMonth">
          <ChevronRightIcon class="h-5 w-5" />
        </BaseButton>
      </div>

      <!-- Monthly Summary -->
      <MonthlySummary
        :incomes="monthlyIncomes"
        :expenses="monthlyExpenses"
        :balance="monthlyBalance"
      />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Expenses by Category Chart -->
        <ExpensesByCategory :data="categoryChartData" />

        <!-- Savings Boxes Summary -->
        <BaseCard title="Cajas de Ahorro">
          <div v-if="savingsBoxesStore.boxes.length === 0" class="text-center py-8 text-gray-500">
            No hay cajas de ahorro configuradas
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="box in savingsBoxesStore.boxes"
              :key="box.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: box.color }"
                />
                <div>
                  <p class="font-medium text-gray-900">{{ box.name }}</p>
                  <p class="text-xs text-gray-500">{{ box.targetPercentage }}%</p>
                </div>
              </div>
              <span class="font-semibold text-gray-900">
                {{ formatCurrency(box.currentBalance) }}
              </span>
            </div>

            <div class="pt-4 border-t border-gray-200 flex items-center justify-between">
              <span class="font-medium text-gray-700">Total en cajas</span>
              <span class="text-lg font-bold text-primary-600">
                {{ formatCurrency(savingsBoxesStore.totalBalance) }}
              </span>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Loading overlay -->
      <div
        v-if="isLoading"
        class="fixed inset-0 bg-white/50 flex items-center justify-center z-50"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    </div>
  </MainLayout>
</template>
