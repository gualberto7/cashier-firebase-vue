<script setup lang="ts">
import { onMounted } from 'vue'
import { MainLayout } from '@/components/layout'
import { BaseButton, BaseCard } from '@/components/common'
import { ExpensesByCategory, MonthlySummary } from '@/components/reports'
import { useReports } from '@/composables/useReports'
import { useSavingsBoxesStore } from '@/stores/savingsBoxes'
import { useTripsStore } from '@/stores/trips'
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/currency'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const {
  isLoading,
  reportMode,
  selectedTripId,
  monthlyExpenses,
  monthlyIncomes,
  monthlyBalance,
  tripTotal,
  tripExpenseCount,
  formattedMonth,
  categoryChartData,
  loadMonthlyReport,
  previousMonth,
  nextMonth,
  setReportMode,
  selectTrip
} = useReports()

const savingsBoxesStore = useSavingsBoxesStore()
const tripsStore = useTripsStore()

function formatTripDate(date: Date): string {
  return format(date, "d 'de' MMM yyyy", { locale: es })
}

function getTripDateRange(tripId: string): string {
  const trip = tripsStore.getTripById(tripId)
  if (!trip) return ''
  const start = formatTripDate(trip.startDate)
  const end = trip.endDate ? formatTripDate(trip.endDate) : 'en curso'
  return `${start} – ${end}`
}

onMounted(async () => {
  await Promise.all([
    savingsBoxesStore.fetchBoxes(),
    tripsStore.fetchTrips(),
    loadMonthlyReport()
  ])
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
        <p class="text-gray-500">Análisis de tus finanzas</p>
      </div>

      <!-- Mode toggle -->
      <div class="flex rounded-lg border border-gray-200 p-1 gap-1 bg-gray-50 w-fit">
        <button
          :class="[
            'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
            reportMode === 'monthly'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          ]"
          @click="setReportMode('monthly')"
        >
          Mensual
        </button>
        <button
          :class="[
            'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
            reportMode === 'trip'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          ]"
          @click="setReportMode('trip')"
        >
          <MapPinIcon class="h-4 w-4" />
          Por viaje
        </button>
      </div>

      <!-- MONTHLY MODE -->
      <template v-if="reportMode === 'monthly'">
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

        <MonthlySummary
          :incomes="monthlyIncomes"
          :expenses="monthlyExpenses"
          :balance="monthlyBalance"
        />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpensesByCategory :data="categoryChartData" />

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
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: box.color }" />
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
      </template>

      <!-- TRIP MODE -->
      <template v-else>
        <!-- Trip selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar viaje</label>
          <select
            class="input max-w-sm"
            :value="selectedTripId ?? ''"
            @change="e => selectTrip((e.target as HTMLSelectElement).value)"
          >
            <option value="" disabled>Elige un viaje...</option>
            <option
              v-for="trip in tripsStore.trips"
              :key="trip.id"
              :value="trip.id"
            >
              {{ trip.name }}
            </option>
          </select>
          <p v-if="tripsStore.trips.length === 0" class="mt-1 text-sm text-gray-500">
            No hay viajes registrados.
          </p>
        </div>

        <!-- Trip summary + chart -->
        <template v-if="selectedTripId">
          <!-- Trip info card -->
          <div
            class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <div
              class="h-1.5"
              :style="{ backgroundColor: tripsStore.getTripById(selectedTripId)?.color ?? '#3b82f6' }"
            />
            <div class="p-5">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">
                    {{ tripsStore.getTripById(selectedTripId)?.name }}
                  </h2>
                  <p class="text-sm text-gray-500 mt-0.5">{{ getTripDateRange(selectedTripId) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-red-600">{{ formatCurrency(tripTotal) }}</p>
                  <p class="text-xs text-gray-400">{{ tripExpenseCount }} gasto{{ tripExpenseCount !== 1 ? 's' : '' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Category chart -->
          <ExpensesByCategory :data="categoryChartData" />
        </template>

        <!-- Empty state when no trip selected -->
        <div
          v-else
          class="text-center py-16 text-gray-400"
        >
          <MapPinIcon class="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p class="text-sm">Selecciona un viaje para ver su reporte</p>
        </div>
      </template>

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
