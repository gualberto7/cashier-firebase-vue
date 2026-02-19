<script setup lang="ts">
import { ref } from 'vue'
import { MainLayout } from '@/components/layout'
import { BaseButton, BaseCard } from '@/components/common'
import { ExpenseForm, ExpenseList, ExpenseFilters } from '@/components/expenses'
import { useExpenses } from '@/composables/useExpenses'
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { Expense, ExpenseFormData, ExpenseFilters as IExpenseFilters } from '@/types'

const {
  expenses,
  isLoading,
  categories,
  filters,
  totalExpenses,
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  setFilters
} = useExpenses()

const showForm = ref(false)
const editingExpense = ref<Expense | null>(null)
const showDeleteConfirm = ref(false)
const expenseToDelete = ref<Expense | null>(null)

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function handleNew() {
  editingExpense.value = null
  showForm.value = true
}

function handleEdit(expense: Expense) {
  editingExpense.value = expense
  showForm.value = true
}

function handleDeleteClick(expense: Expense) {
  expenseToDelete.value = expense
  showDeleteConfirm.value = true
}

async function handleSave(data: ExpenseFormData) {
  if (editingExpense.value) {
    await updateExpense(editingExpense.value.id, data)
  } else {
    await createExpense(data)
  }
  showForm.value = false
}

async function confirmDelete() {
  if (expenseToDelete.value) {
    await deleteExpense(expenseToDelete.value.id)
    expenseToDelete.value = null
    showDeleteConfirm.value = false
  }
}

async function handleFilterApply() {
  await fetchExpenses(filters.value)
}

async function handleFilterClear() {
  await fetchExpenses({})
}

function handleFiltersUpdate(newFilters: IExpenseFilters) {
  setFilters(newFilters)
}
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gastos</h1>
          <p class="text-gray-500">Total: {{ formatCurrency(totalExpenses) }}</p>
        </div>
        <BaseButton @click="handleNew">
          <PlusIcon class="h-5 w-5 mr-1" />
          Nuevo gasto
        </BaseButton>
      </div>

      <ExpenseFilters
        :categories="categories"
        :model-value="filters"
        @update:model-value="handleFiltersUpdate"
        @apply="handleFilterApply"
        @clear="handleFilterClear"
      />

      <BaseCard :padding="false">
        <div class="p-4">
          <ExpenseList
            :expenses="expenses"
            :is-loading="isLoading"
            @edit="handleEdit"
            @delete="handleDeleteClick"
          />
        </div>
      </BaseCard>

      <ExpenseForm
        v-model="showForm"
        :expense="editingExpense"
        :categories="categories"
        @save="handleSave"
      />

      <!-- Delete Confirmation Modal -->
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
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Eliminar gasto
            </h3>
            <p class="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.
            </p>
            <div class="flex justify-end gap-3">
              <BaseButton variant="secondary" @click="showDeleteConfirm = false">
                Cancelar
              </BaseButton>
              <BaseButton variant="danger" @click="confirmDelete">
                Eliminar
              </BaseButton>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </MainLayout>
</template>
