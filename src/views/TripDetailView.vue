<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MainLayout } from '@/components/layout'
import { BaseButton, BaseCard } from '@/components/common'
import { ExpenseForm, ExpenseList } from '@/components/expenses'
import { TripForm } from '@/components/trips'
import { useTripsStore } from '@/stores/trips'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { expensesService } from '@/services/expenses.service'
import { PlusIcon, ArrowLeftIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '@/utils/currency'
import type { Expense, ExpenseFormData, TripFormData } from '@/types'

const route = useRoute()
const router = useRouter()
const tripsStore = useTripsStore()
const authStore = useAuthStore()
const categoriesStore = useCategoriesStore()

const tripId = computed(() => route.params.id as string)
const trip = computed(() => tripsStore.getTripById(tripId.value))

const tripExpenses = ref<Expense[]>([])
const isLoadingExpenses = ref(false)

const showExpenseForm = ref(false)
const editingExpense = ref<Expense | null>(null)
const showDeleteConfirm = ref(false)
const expenseToDelete = ref<Expense | null>(null)
const showTripForm = ref(false)

const totalSpent = computed(() =>
  tripExpenses.value.reduce((sum, e) => sum + e.amount, 0)
)

function formatTripDate(date: Date): string {
  return format(date, "d 'de' MMM yyyy", { locale: es })
}

const dateRange = computed(() => {
  if (!trip.value) return ''
  const start = formatTripDate(trip.value.startDate)
  const end = trip.value.endDate ? formatTripDate(trip.value.endDate) : 'en curso'
  return `${start} – ${end}`
})

async function loadExpenses() {
  if (!authStore.user) return
  isLoadingExpenses.value = true
  try {
    tripExpenses.value = await expensesService.getAll(authStore.user.uid, { tripId: tripId.value })
  } finally {
    isLoadingExpenses.value = false
  }
}

onMounted(async () => {
  if (tripsStore.trips.length === 0) {
    await tripsStore.fetchTrips()
  }
  if (categoriesStore.categories.length === 0) {
    await categoriesStore.fetchCategories()
  }
  await loadExpenses()
})

function handleNewExpense() {
  editingExpense.value = null
  showExpenseForm.value = true
}

function handleEditExpense(expense: Expense) {
  editingExpense.value = expense
  showExpenseForm.value = true
}

function handleDeleteClick(expense: Expense) {
  expenseToDelete.value = expense
  showDeleteConfirm.value = true
}

async function handleSaveExpense(data: ExpenseFormData) {
  if (!authStore.user) return

  const category = categoriesStore.getCategoryById(data.categoryId)
  if (!category) return

  if (editingExpense.value) {
    await expensesService.update(authStore.user.uid, editingExpense.value.id, data, category)
    const index = tripExpenses.value.findIndex(e => e.id === editingExpense.value!.id)
    if (index !== -1) {
      tripExpenses.value[index] = {
        ...tripExpenses.value[index],
        ...data,
        categoryName: category.name,
        updatedAt: new Date()
      }
    }
  } else {
    const newExpense = await expensesService.create(authStore.user.uid, data, category)
    tripExpenses.value.unshift(newExpense)
  }
  showExpenseForm.value = false
}

async function confirmDeleteExpense() {
  if (!authStore.user || !expenseToDelete.value) return
  await expensesService.delete(authStore.user.uid, expenseToDelete.value.id)
  tripExpenses.value = tripExpenses.value.filter(e => e.id !== expenseToDelete.value!.id)
  expenseToDelete.value = null
  showDeleteConfirm.value = false
}

async function handleSaveTrip(data: TripFormData) {
  await tripsStore.updateTrip(tripId.value, data)
  showTripForm.value = false
}
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <!-- Back + header -->
      <div>
        <button
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          @click="router.back()"
        >
          <ArrowLeftIcon class="h-4 w-4" />
          Volver a Viajes
        </button>

        <div v-if="trip" class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div
              class="w-4 h-12 rounded-full shrink-0"
              :style="{ backgroundColor: trip.color }"
            />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ trip.name }}</h1>
              <p class="text-gray-500">{{ dateRange }}</p>
              <p v-if="trip.description" class="text-sm text-gray-400 mt-0.5">{{ trip.description }}</p>
            </div>
          </div>
          <BaseButton variant="secondary" @click="showTripForm = true">
            <PencilIcon class="h-4 w-4 mr-1" />
            Editar
          </BaseButton>
        </div>

        <div v-else class="animate-pulse h-12 bg-gray-100 rounded-lg" />
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-2 gap-4">
        <BaseCard>
          <p class="text-sm text-gray-500 mb-1">Total gastado</p>
          <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalSpent) }}</p>
        </BaseCard>
        <BaseCard>
          <p class="text-sm text-gray-500 mb-1">Gastos registrados</p>
          <p class="text-2xl font-bold text-gray-900">{{ tripExpenses.length }}</p>
        </BaseCard>
      </div>

      <!-- Expenses list -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Gastos del viaje</h2>
        <BaseButton @click="handleNewExpense">
          <PlusIcon class="h-5 w-5 mr-1" />
          Agregar gasto
        </BaseButton>
      </div>

      <BaseCard :padding="false">
        <div class="p-4">
          <ExpenseList
            :expenses="tripExpenses"
            :is-loading="isLoadingExpenses"
            @edit="handleEditExpense"
            @delete="handleDeleteClick"
          />
        </div>
      </BaseCard>

      <!-- Expense form with tripId pre-set -->
      <ExpenseForm
        v-model="showExpenseForm"
        :expense="editingExpense"
        :categories="categoriesStore.categories"
        :trip-id="tripId"
        @save="handleSaveExpense"
      />

      <!-- Trip edit form -->
      <TripForm
        v-model="showTripForm"
        :trip="trip"
        @save="handleSaveTrip"
      />

      <!-- Delete expense confirmation -->
      <Teleport to="body">
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            class="fixed inset-0 bg-black/50"
            @click="showDeleteConfirm = false"
          />
          <div class="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Eliminar gasto</h3>
            <p class="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.
            </p>
            <div class="flex justify-end gap-3">
              <BaseButton variant="secondary" @click="showDeleteConfirm = false">
                Cancelar
              </BaseButton>
              <BaseButton variant="danger" @click="confirmDeleteExpense">
                Eliminar
              </BaseButton>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </MainLayout>
</template>
