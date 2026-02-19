<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { MainLayout } from '@/components/layout'
import { BaseCard, BaseButton } from '@/components/common'
import { MonthlySummary } from '@/components/reports'
import { useReports } from '@/composables/useReports'
import { useSavingsBoxesStore } from '@/stores/savingsBoxes'
import { useExpensesStore } from '@/stores/expenses'
import { useIncomesStore } from '@/stores/incomes'
import {
  WalletIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const {
  monthlyExpenses,
  monthlyIncomes,
  monthlyBalance,
  loadMonthlyReport
} = useReports()

const savingsBoxesStore = useSavingsBoxesStore()
const expensesStore = useExpensesStore()
const incomesStore = useIncomesStore()

const recentExpenses = computed(() => expensesStore.expenses.slice(0, 5))
const recentIncomes = computed(() => incomesStore.incomes.slice(0, 5))

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function formatDate(date: Date): string {
  return format(date, "d MMM", { locale: es })
}

onMounted(async () => {
  await Promise.all([
    savingsBoxesStore.fetchBoxes(),
    expensesStore.fetchExpenses(),
    incomesStore.fetchIncomes(),
    loadMonthlyReport()
  ])
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-500">Resumen de tus finanzas</p>
      </div>

      <!-- Monthly Summary -->
      <MonthlySummary
        :incomes="monthlyIncomes"
        :expenses="monthlyExpenses"
        :balance="monthlyBalance"
      />

      <!-- Savings Boxes -->
      <BaseCard title="Cajas de Ahorro">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Cajas de Ahorro</h3>
            <RouterLink to="/savings">
              <BaseButton variant="ghost" size="sm">Ver todas</BaseButton>
            </RouterLink>
          </div>
        </template>

        <div v-if="savingsBoxesStore.boxes.length === 0" class="text-center py-6 text-gray-500">
          <WalletIcon class="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p>No tienes cajas de ahorro</p>
          <RouterLink to="/savings" class="text-primary-600 hover:underline text-sm">
            Crear una caja
          </RouterLink>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="box in savingsBoxesStore.boxes.slice(0, 6)"
            :key="box.id"
            class="p-4 rounded-lg border border-gray-200"
          >
            <div class="flex items-center gap-2 mb-2">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: box.color }"
              />
              <span class="font-medium text-gray-900">{{ box.name }}</span>
            </div>
            <p class="text-xl font-bold text-gray-900">
              {{ formatCurrency(box.currentBalance) }}
            </p>
            <p class="text-xs text-gray-500">{{ box.targetPercentage }}% de ingresos</p>
          </div>
        </div>
      </BaseCard>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Recent Expenses -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Últimos gastos</h3>
              <RouterLink to="/expenses">
                <BaseButton variant="ghost" size="sm">Ver todos</BaseButton>
              </RouterLink>
            </div>
          </template>

          <div v-if="recentExpenses.length === 0" class="text-center py-6 text-gray-500">
            <BanknotesIcon class="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p>No hay gastos registrados</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="expense in recentExpenses"
              :key="expense.id"
              class="flex items-center justify-between"
            >
              <div>
                <p class="font-medium text-gray-900 text-sm">{{ expense.description }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(expense.date) }}</p>
              </div>
              <span class="font-semibold text-red-600 text-sm">
                -{{ formatCurrency(expense.amount) }}
              </span>
            </div>
          </div>

          <template #footer>
            <RouterLink to="/expenses" class="block">
              <BaseButton variant="secondary" size="sm" class="w-full">
                <PlusIcon class="h-4 w-4 mr-1" />
                Agregar gasto
              </BaseButton>
            </RouterLink>
          </template>
        </BaseCard>

        <!-- Recent Incomes -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Últimos ingresos</h3>
              <RouterLink to="/incomes">
                <BaseButton variant="ghost" size="sm">Ver todos</BaseButton>
              </RouterLink>
            </div>
          </template>

          <div v-if="recentIncomes.length === 0" class="text-center py-6 text-gray-500">
            <ArrowTrendingUpIcon class="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p>No hay ingresos registrados</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="income in recentIncomes"
              :key="income.id"
              class="flex items-center justify-between"
            >
              <div>
                <p class="font-medium text-gray-900 text-sm">{{ income.description }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(income.date) }}</p>
              </div>
              <span class="font-semibold text-green-600 text-sm">
                +{{ formatCurrency(income.amount) }}
              </span>
            </div>
          </div>

          <template #footer>
            <RouterLink to="/incomes" class="block">
              <BaseButton variant="secondary" size="sm" class="w-full">
                <PlusIcon class="h-4 w-4 mr-1" />
                Agregar ingreso
              </BaseButton>
            </RouterLink>
          </template>
        </BaseCard>
      </div>
    </div>
  </MainLayout>
</template>
