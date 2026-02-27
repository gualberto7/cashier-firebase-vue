<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { BaseButton, BaseInput, BaseModal } from '@/components/common'
import { format } from 'date-fns'
import type { Trip, TripFormData } from '@/types'

interface Props {
  modelValue: boolean
  trip?: Trip | null
}

const props = withDefaults(defineProps<Props>(), {
  trip: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: TripFormData]
}>()

const COLORS = [
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Esmeralda', value: '#10b981' },
  { label: 'Ámbar', value: '#f59e0b' },
  { label: 'Rojo', value: '#ef4444' },
  { label: 'Violeta', value: '#8b5cf6' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Cian', value: '#06b6d4' },
  { label: 'Lima', value: '#84cc16' },
  { label: 'Naranja', value: '#f97316' },
  { label: 'Gris', value: '#6b7280' }
]

const form = ref({
  name: '',
  description: '',
  startDateStr: '',
  endDateStr: '',
  color: COLORS[0].value
})

const errors = ref<Record<string, string>>({})

const isEditing = computed(() => !!props.trip)

function toDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.trip) {
      form.value = {
        name: props.trip.name,
        description: props.trip.description ?? '',
        startDateStr: toDateStr(props.trip.startDate),
        endDateStr: props.trip.endDate ? toDateStr(props.trip.endDate) : '',
        color: props.trip.color
      }
    } else {
      form.value = {
        name: '',
        description: '',
        startDateStr: toDateStr(new Date()),
        endDateStr: '',
        color: COLORS[0].value
      }
    }
    errors.value = {}
  }
})

function validate(): boolean {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
  }

  if (!form.value.startDateStr) {
    errors.value.startDateStr = 'La fecha de inicio es requerida'
  }

  if (form.value.endDateStr && form.value.startDateStr > form.value.endDateStr) {
    errors.value.endDateStr = 'La fecha de fin debe ser posterior al inicio'
  }

  return Object.keys(errors.value).length === 0
}

function parseDate(str: string): Date {
  const [year, month, day] = str.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function handleSubmit() {
  if (!validate()) return

  const data: TripFormData = {
    name: form.value.name.trim(),
    description: form.value.description.trim(),
    startDate: parseDate(form.value.startDateStr),
    endDate: form.value.endDateStr ? parseDate(form.value.endDateStr) : null,
    color: form.value.color
  }

  emit('save', data)
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEditing ? 'Editar viaje' : 'Nuevo viaje'"
    @update:model-value="close"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseInput
        v-model="form.name"
        label="Nombre"
        placeholder="Ej: Viaje a Santa Cruz"
        :error="errors.name"
        required
      />

      <div>
        <label class="label">Descripción <span class="text-gray-400 font-normal">(opcional)</span></label>
        <textarea
          v-model="form.description"
          class="input resize-none"
          rows="2"
          placeholder="Notas del viaje..."
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="label">Fecha de inicio <span class="text-red-500">*</span></label>
          <input
            v-model="form.startDateStr"
            type="date"
            class="input"
            required
          />
          <p v-if="errors.startDateStr" class="mt-1 text-xs text-red-600">{{ errors.startDateStr }}</p>
        </div>
        <div>
          <label class="label">Fecha de fin <span class="text-gray-400 font-normal">(opcional)</span></label>
          <input
            v-model="form.endDateStr"
            type="date"
            class="input"
          />
          <p v-if="errors.endDateStr" class="mt-1 text-xs text-red-600">{{ errors.endDateStr }}</p>
        </div>
      </div>

      <div>
        <label class="label">Color</label>
        <div class="flex flex-wrap gap-2 mt-1">
          <button
            v-for="color in COLORS"
            :key="color.value"
            type="button"
            :title="color.label"
            :style="{ backgroundColor: color.value }"
            :class="[
              'w-8 h-8 rounded-full transition-all',
              form.color === color.value
                ? 'ring-2 ring-offset-2 ring-gray-500 scale-110'
                : 'hover:scale-105'
            ]"
            @click="form.color = color.value"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton variant="secondary" @click="close">
          Cancelar
        </BaseButton>
        <BaseButton @click="handleSubmit">
          {{ isEditing ? 'Guardar cambios' : 'Crear viaje' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
