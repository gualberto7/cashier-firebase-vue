<script setup lang="ts">
import { ref, watch } from 'vue'
import { BaseButton, BaseSelect } from '@/components/common'
import { FunnelIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { ExpenseFilters, Category } from '@/types'

interface Props {
  categories: Category[]
  modelValue: ExpenseFilters
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [filters: ExpenseFilters]
  apply: []
  clear: []
}>()

const localFilters = ref<ExpenseFilters>({ ...props.modelValue })
const showFilters = ref(false)

watch(() => props.modelValue, (newValue) => {
  localFilters.value = { ...newValue }
}, { deep: true })

const categoryOptions = [
  { value: '', label: 'Todas las categorías' },
  ...props.categories.map(c => ({ value: c.id, label: c.name }))
]

function applyFilters() {
  emit('update:modelValue', { ...localFilters.value })
  emit('apply')
}

function clearFilters() {
  localFilters.value = {}
  emit('update:modelValue', {})
  emit('clear')
}

const hasActiveFilters = () => {
  return localFilters.value.startDate ||
    localFilters.value.endDate ||
    localFilters.value.categoryId ||
    localFilters.value.minAmount ||
    localFilters.value.maxAmount
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <BaseButton
        variant="secondary"
        size="sm"
        @click="showFilters = !showFilters"
      >
        <FunnelIcon class="h-4 w-4 mr-1" />
        Filtros
        <span
          v-if="hasActiveFilters()"
          class="ml-1 w-2 h-2 rounded-full bg-primary-600"
        />
      </BaseButton>

      <BaseButton
        v-if="hasActiveFilters()"
        variant="ghost"
        size="sm"
        @click="clearFilters"
      >
        <XMarkIcon class="h-4 w-4 mr-1" />
        Limpiar
      </BaseButton>
    </div>

    <div v-if="showFilters" class="p-4 bg-gray-50 rounded-lg space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="label">Desde</label>
          <input
            v-model="localFilters.startDate"
            type="date"
            class="input"
          />
        </div>

        <div>
          <label class="label">Hasta</label>
          <input
            v-model="localFilters.endDate"
            type="date"
            class="input"
          />
        </div>

        <BaseSelect
          :model-value="localFilters.categoryId || ''"
          :options="categoryOptions"
          label="Categoría"
          @update:model-value="localFilters.categoryId = $event as string"
        />

        <div>
          <label class="label">Monto mínimo</label>
          <input
            v-model.number="localFilters.minAmount"
            type="number"
            class="input"
            placeholder="0"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <BaseButton size="sm" @click="applyFilters">
          Aplicar filtros
        </BaseButton>
      </div>
    </div>
  </div>
</template>
