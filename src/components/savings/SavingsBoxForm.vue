<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BaseButton, BaseInput, BaseModal } from '@/components/common'
import { BOX_COLORS, type SavingsBox, type SavingsBoxFormData } from '@/types'

interface Props {
  modelValue: boolean
  box?: SavingsBox | null
  maxPercentage: number
}

const props = withDefaults(defineProps<Props>(), {
  box: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: SavingsBoxFormData]
}>()

const form = ref<SavingsBoxFormData>({
  name: '',
  targetPercentage: 10,
  color: BOX_COLORS[0],
  isActive: true
})

const errors = ref<Record<string, string>>({})

const isEditing = computed(() => !!props.box)

const availablePercentage = computed(() => {
  if (props.box) {
    return props.maxPercentage + props.box.targetPercentage
  }
  return props.maxPercentage
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.box) {
      form.value = {
        name: props.box.name,
        targetPercentage: props.box.targetPercentage,
        color: props.box.color,
        isActive: props.box.isActive
      }
    } else {
      form.value = {
        name: '',
        targetPercentage: Math.min(10, availablePercentage.value),
        color: BOX_COLORS[Math.floor(Math.random() * BOX_COLORS.length)],
        isActive: true
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

  if (form.value.targetPercentage <= 0) {
    errors.value.targetPercentage = 'El porcentaje debe ser mayor a 0'
  } else if (form.value.isActive && form.value.targetPercentage > availablePercentage.value) {
    errors.value.targetPercentage = `El porcentaje máximo disponible es ${availablePercentage.value}%`
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
    :title="isEditing ? 'Editar caja de ahorro' : 'Nueva caja de ahorro'"
    @update:model-value="close"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseInput
        v-model="form.name"
        label="Nombre"
        placeholder="Ej: Emergencias, Vacaciones..."
        :error="errors.name"
        required
      />

      <div>
        <label class="label">Porcentaje de ingresos</label>
        <div class="flex items-center gap-3">
          <input
            v-model.number="form.targetPercentage"
            type="range"
            min="1"
            :max="availablePercentage"
            class="flex-1"
          />
          <span class="w-16 text-right font-medium">{{ form.targetPercentage }}%</span>
        </div>
        <p v-if="errors.targetPercentage" class="mt-1 text-sm text-red-600">
          {{ errors.targetPercentage }}
        </p>
        <p class="mt-1 text-xs text-gray-500">
          Disponible: {{ availablePercentage }}%
        </p>
      </div>

      <div>
        <label class="label">Color</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="color in BOX_COLORS"
            :key="color"
            type="button"
            class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
            :class="form.color === color ? 'border-gray-900 scale-110' : 'border-transparent'"
            :style="{ backgroundColor: color }"
            @click="form.color = color"
          />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <input
          id="isActive"
          v-model="form.isActive"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label for="isActive" class="text-sm text-gray-700">
          Caja activa (recibe distribución de ingresos)
        </label>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton variant="secondary" @click="close">
          Cancelar
        </BaseButton>
        <BaseButton @click="handleSubmit">
          {{ isEditing ? 'Guardar cambios' : 'Crear caja' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
