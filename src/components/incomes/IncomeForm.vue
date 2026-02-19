<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BaseButton, BaseInput, BaseModal } from '@/components/common'
import { format } from 'date-fns'
import IncomeDistributionPreview from './IncomeDistributionPreview.vue'
import type { Income, IncomeFormData, IncomeDistribution, SavingsBox } from '@/types'

interface Props {
  modelValue: boolean
  income?: Income | null
  savingsBoxes: SavingsBox[]
  calculateDistribution: (amount: number) => IncomeDistribution[]
}

const props = withDefaults(defineProps<Props>(), {
  income: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: IncomeFormData, withDistribution: boolean]
}>()

const form = ref<IncomeFormData>({
  amount: 0,
  description: '',
  date: new Date()
})

const dateString = ref('')
const errors = ref<Record<string, string>>({})
const distributeToBoxes = ref(true)

const isEditing = computed(() => !!props.income)

const previewDistribution = computed(() => {
  if (!distributeToBoxes.value || form.value.amount <= 0) {
    return []
  }
  return props.calculateDistribution(form.value.amount)
})

const hasActiveBoxes = computed(() =>
  props.savingsBoxes.some(b => b.isActive && b.targetPercentage > 0)
)

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.income) {
      form.value = {
        amount: props.income.amount,
        description: props.income.description,
        date: props.income.date
      }
      dateString.value = format(props.income.date, 'yyyy-MM-dd')
      distributeToBoxes.value = false // Can't redistribute existing income
    } else {
      form.value = {
        amount: 0,
        description: '',
        date: new Date()
      }
      dateString.value = format(new Date(), 'yyyy-MM-dd')
      distributeToBoxes.value = hasActiveBoxes.value
    }
    errors.value = {}
  }
})

watch(dateString, (value) => {
  if (value) {
    form.value.date = new Date(value + 'T12:00:00')
  }
})

function validate(): boolean {
  errors.value = {}

  if (form.value.amount <= 0) {
    errors.value.amount = 'El monto debe ser mayor a 0'
  }

  if (!form.value.description.trim()) {
    errors.value.description = 'La descripción es requerida'
  }

  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return
  emit('save', { ...form.value }, distributeToBoxes.value && !isEditing.value)
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEditing ? 'Editar ingreso' : 'Nuevo ingreso'"
    size="lg"
    @update:model-value="close"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseInput
        v-model="form.amount"
        type="number"
        label="Monto"
        placeholder="0.00"
        :error="errors.amount"
        required
      />

      <BaseInput
        v-model="form.description"
        label="Descripción"
        placeholder="Ej: Salario mensual"
        :error="errors.description"
        required
      />

      <div>
        <label class="label">Fecha</label>
        <input
          v-model="dateString"
          type="date"
          class="input"
          required
        />
      </div>

      <div v-if="!isEditing && hasActiveBoxes" class="flex items-center gap-2">
        <input
          id="distributeToBoxes"
          v-model="distributeToBoxes"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label for="distributeToBoxes" class="text-sm text-gray-700">
          Distribuir automáticamente a cajas de ahorro
        </label>
      </div>

      <IncomeDistributionPreview
        v-if="distributeToBoxes && !isEditing && previewDistribution.length > 0"
        :distributions="previewDistribution"
        :total="form.amount"
      />

      <div
        v-if="!hasActiveBoxes && !isEditing"
        class="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700"
      >
        No tienes cajas de ahorro activas. El ingreso se registrará sin distribución.
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton variant="secondary" @click="close">
          Cancelar
        </BaseButton>
        <BaseButton @click="handleSubmit">
          {{ isEditing ? 'Guardar cambios' : 'Agregar ingreso' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
