<script setup lang="ts">
import { ref, watch } from 'vue'
import { BaseButton, BaseInput, BaseModal } from '@/components/common'
import type { SavingsBox } from '@/types'
import { formatCurrency } from '@/utils/currency'

interface Props {
  modelValue: boolean
  box: SavingsBox | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  withdraw: [amount: number]
}>()

const amount = ref<number | ''>('')
const error = ref('')

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    amount.value = ''
    error.value = ''
  }
})

function validate(): boolean {
  error.value = ''
  if (amount.value === '' || amount.value <= 0) {
    error.value = 'Ingresa un monto válido'
    return false
  }
  if (props.box && amount.value > props.box.currentBalance) {
    error.value = `El monto máximo disponible es ${formatCurrency(props.box.currentBalance)}`
    return false
  }
  return true
}

function handleSubmit() {
  if (!validate()) return
  emit('withdraw', amount.value as number)
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Retirar de caja de ahorro"
    @update:model-value="close"
  >
    <div v-if="box" class="space-y-4">
      <!-- Box info -->
      <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
        <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: box.color }" />
        <div>
          <p class="font-medium text-gray-900">{{ box.name }}</p>
          <p class="text-sm text-gray-500">
            Balance disponible: <span class="font-semibold text-gray-900">{{ formatCurrency(box.currentBalance) }}</span>
          </p>
        </div>
      </div>

      <BaseInput
        v-model.number="amount"
        label="Monto a retirar"
        type="number"
        placeholder="0.00"
        :min="0.01"
        :max="box.currentBalance"
        step="0.01"
        :error="error"
        required
      />
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton variant="secondary" @click="close">
          Cancelar
        </BaseButton>
        <BaseButton variant="danger" @click="handleSubmit">
          Retirar
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
