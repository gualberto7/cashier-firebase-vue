<script setup lang="ts">
import { ref } from 'vue'
import { MainLayout } from '@/components/layout'
import { BaseButton, BaseCard, BaseEmpty } from '@/components/common'
import { SavingsBoxCard, SavingsBoxForm, SavingsBoxWithdrawForm } from '@/components/savings'
import { useSavingsBoxes } from '@/composables/useSavingsBoxes'
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { SavingsBox, SavingsBoxFormData } from '@/types'
import { formatCurrency } from '@/utils/currency'

const {
  boxes,
  isLoading,
  totalBalance,
  totalPercentage,
  remainingPercentage,
  createBox,
  updateBox,
  deleteBox,
  withdrawFromBox
} = useSavingsBoxes()

const showForm = ref(false)
const editingBox = ref<SavingsBox | null>(null)
const showDeleteConfirm = ref(false)
const boxToDelete = ref<SavingsBox | null>(null)
const showWithdrawForm = ref(false)
const withdrawingBox = ref<SavingsBox | null>(null)

function handleNew() {
  editingBox.value = null
  showForm.value = true
}

function handleEdit(box: SavingsBox) {
  editingBox.value = box
  showForm.value = true
}

function handleDeleteClick(box: SavingsBox) {
  boxToDelete.value = box
  showDeleteConfirm.value = true
}

async function handleSave(data: SavingsBoxFormData) {
  if (editingBox.value) {
    await updateBox(editingBox.value.id, data)
  } else {
    await createBox(data)
  }
  showForm.value = false
}

function handleWithdraw(box: SavingsBox) {
  withdrawingBox.value = box
  showWithdrawForm.value = true
}

async function confirmWithdraw(amount: number) {
  if (withdrawingBox.value) {
    await withdrawFromBox(withdrawingBox.value.id, amount)
    withdrawingBox.value = null
  }
}

async function confirmDelete() {
  if (boxToDelete.value) {
    await deleteBox(boxToDelete.value.id)
    boxToDelete.value = null
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Cajas de Ahorro</h1>
          <p class="text-gray-500">
            Balance total: {{ formatCurrency(totalBalance) }}
          </p>
        </div>
        <BaseButton @click="handleNew" :disabled="remainingPercentage <= 0">
          <PlusIcon class="h-5 w-5 mr-1" />
          Nueva caja
        </BaseButton>
      </div>

      <!-- Percentage Summary -->
      <BaseCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Porcentaje asignado</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalPercentage }}%</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Disponible</p>
            <p class="text-2xl font-bold text-primary-600">{{ remainingPercentage }}%</p>
          </div>
        </div>
        <div class="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary-600 transition-all duration-300"
            :style="{ width: `${totalPercentage}%` }"
          />
        </div>
      </BaseCard>

      <!-- Boxes Grid -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-100 rounded-xl h-40" />
      </div>

      <BaseEmpty
        v-else-if="boxes.length === 0"
        title="No tienes cajas de ahorro"
        description="Crea tu primera caja para comenzar a distribuir tus ingresos automáticamente"
      >
        <template #action>
          <BaseButton @click="handleNew">
            <PlusIcon class="h-5 w-5 mr-1" />
            Crear primera caja
          </BaseButton>
        </template>
      </BaseEmpty>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SavingsBoxCard
          v-for="box in boxes"
          :key="box.id"
          :box="box"
          @edit="handleEdit"
          @delete="handleDeleteClick"
          @withdraw="handleWithdraw"
        />
      </div>

      <SavingsBoxForm
        v-model="showForm"
        :box="editingBox"
        :max-percentage="remainingPercentage"
        @save="handleSave"
      />

      <SavingsBoxWithdrawForm
        v-model="showWithdrawForm"
        :box="withdrawingBox"
        @withdraw="confirmWithdraw"
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
              Eliminar caja de ahorro
            </h3>
            <p class="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar "{{ boxToDelete?.name }}"?
              El balance actual de {{ formatCurrency(boxToDelete?.currentBalance || 0) }} se perderá.
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
