<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BaseButton, BaseInput, BaseModal, BaseSelect } from '@/components/common'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { APP_TIMEZONE } from '@/utils/date'
import type { Expense, ExpenseFormData, Category } from '@/types'

interface Props {
  modelValue: boolean
  expense?: Expense | null
  categories: Category[]
  tripId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  expense: null,
  tripId: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: ExpenseFormData]
}>()

const form = ref<ExpenseFormData>({
  amount: 0,
  description: '',
  date: new Date(),
  categoryId: '',
  tripId: null
})

const dateString = ref('')
const errors = ref<Record<string, string>>({})

const isEditing = computed(() => !!props.expense)

const categoryOptions = computed(() =>
  props.categories.map(c => ({ value: c.id, label: c.name }))
)

function toDatetimeLocal(date: Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "yyyy-MM-dd'T'HH:mm")
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.expense) {
      form.value = {
        amount: props.expense.amount,
        description: props.expense.description,
        date: props.expense.date,
        categoryId: props.expense.categoryId,
        tripId: props.expense.tripId ?? props.tripId
      }
      dateString.value = toDatetimeLocal(props.expense.date)
    } else {
      form.value = {
        amount: 0,
        description: '',
        date: new Date(),
        categoryId: props.categories[0]?.id || '',
        tripId: props.tripId
      }
      dateString.value = toDatetimeLocal(new Date())
    }
    errors.value = {}
  }
})

watch(dateString, (value) => {
  if (value) {
    form.value.date = fromZonedTime(value, APP_TIMEZONE)
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

  if (!form.value.categoryId) {
    errors.value.categoryId = 'Selecciona una categoría'
  }

  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return
  emit('save', { ...form.value })
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEditing ? 'Editar gasto' : 'Nuevo gasto'"
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
        placeholder="Ej: Compras en supermercado"
        :error="errors.description"
        required
      />

      <div>
        <label class="label">Fecha</label>
        <input
          v-model="dateString"
          type="datetime-local"
          class="input"
          required
        />
      </div>

      <BaseSelect
        v-model="form.categoryId"
        :options="categoryOptions"
        label="Categoría"
        placeholder="Selecciona una categoría"
        :error="errors.categoryId"
        required
      />
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton variant="secondary" @click="close">
          Cancelar
        </BaseButton>
        <BaseButton @click="handleSubmit">
          {{ isEditing ? 'Guardar cambios' : 'Agregar gasto' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
