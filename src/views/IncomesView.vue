<script setup lang="ts">
import { ref } from 'vue'
import { MainLayout } from '@/components/layout'
import { BaseButton, BaseCard } from '@/components/common'
import { IncomeForm, IncomeList } from '@/components/incomes'
import { useIncomes } from '@/composables/useIncomes'
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { Income, IncomeFormData } from '@/types'
import { formatCurrency } from '@/utils/currency'

const {
  incomes,
  isLoading,
  totalIncomes,
  savingsBoxes,
  calculatePreviewDistribution,
  createIncomeWithDistribution,
  createIncome,
  updateIncome,
  deleteIncome
} = useIncomes()

const showForm = ref(false)
const editingIncome = ref<Income | null>(null)
const showDeleteConfirm = ref(false)
const incomeToDelete = ref<Income | null>(null)

function handleNew() {
  editingIncome.value = null
  showForm.value = true
}

function handleEdit(income: Income) {
  editingIncome.value = income
  showForm.value = true
}

function handleDeleteClick(income: Income) {
  incomeToDelete.value = income
  showDeleteConfirm.value = true
}

async function handleSave(data: IncomeFormData, withDistribution: boolean) {
  if (editingIncome.value) {
    await updateIncome(editingIncome.value.id, data)
  } else {
    if (withDistribution) {
      await createIncomeWithDistribution(data)
    } else {
      await createIncome(data)
    }
  }
  showForm.value = false
}

async function confirmDelete() {
  if (incomeToDelete.value) {
    await deleteIncome(incomeToDelete.value.id)
    incomeToDelete.value = null
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Ingresos</h1>
          <p class="text-gray-500">Total: {{ formatCurrency(totalIncomes) }}</p>
        </div>
        <BaseButton @click="handleNew">
          <PlusIcon class="h-5 w-5 mr-1" />
          Nuevo ingreso
        </BaseButton>
      </div>

      <BaseCard :padding="false">
        <div class="p-4">
          <IncomeList
            :incomes="incomes"
            :is-loading="isLoading"
            @edit="handleEdit"
            @delete="handleDeleteClick"
          />
        </div>
      </BaseCard>

      <IncomeForm
        v-model="showForm"
        :income="editingIncome"
        :savings-boxes="savingsBoxes"
        :calculate-distribution="calculatePreviewDistribution"
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
              Eliminar ingreso
            </h3>
            <p class="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar este ingreso? Esta acción no se puede deshacer.
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
