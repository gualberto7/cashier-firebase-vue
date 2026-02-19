<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { MainLayout } from '@/components/layout'
import { BaseButton, BaseCard, BaseInput, BaseModal, BaseEmpty } from '@/components/common'
import { useCategoriesStore } from '@/stores/categories'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { CATEGORY_COLORS, type Category, type CategoryFormData } from '@/types'

const store = useCategoriesStore()

const showForm = ref(false)
const editingCategory = ref<Category | null>(null)
const showDeleteConfirm = ref(false)
const categoryToDelete = ref<Category | null>(null)

const form = ref<CategoryFormData>({
  name: '',
  icon: 'tag',
  color: CATEGORY_COLORS[0]
})

const errors = ref<Record<string, string>>({})

const isEditing = computed(() => !!editingCategory.value)

function handleNew() {
  editingCategory.value = null
  form.value = {
    name: '',
    icon: 'tag',
    color: CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]
  }
  errors.value = {}
  showForm.value = true
}

function handleEdit(category: Category) {
  editingCategory.value = category
  form.value = {
    name: category.name,
    icon: category.icon,
    color: category.color
  }
  errors.value = {}
  showForm.value = true
}

function handleDeleteClick(category: Category) {
  categoryToDelete.value = category
  showDeleteConfirm.value = true
}

function validate(): boolean {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSave() {
  if (!validate()) return

  try {
    if (editingCategory.value) {
      await store.updateCategory(editingCategory.value.id, form.value)
    } else {
      await store.createCategory(form.value)
    }
    showForm.value = false
  } catch (e: any) {
    errors.value.general = e.message
  }
}

async function confirmDelete() {
  if (categoryToDelete.value) {
    try {
      await store.deleteCategory(categoryToDelete.value.id)
      categoryToDelete.value = null
      showDeleteConfirm.value = false
    } catch (e: any) {
      // Handle error
    }
  }
}

onMounted(() => {
  store.fetchCategories()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Categorías</h1>
          <p class="text-gray-500">Administra las categorías de gastos</p>
        </div>
        <BaseButton @click="handleNew">
          <PlusIcon class="h-5 w-5 mr-1" />
          Nueva categoría
        </BaseButton>
      </div>

      <!-- Default Categories -->
      <BaseCard title="Categorías predefinidas">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            v-for="category in store.defaultCategories"
            :key="category.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              :style="{ backgroundColor: category.color + '20' }"
            >
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: category.color }"
              />
            </div>
            <span class="font-medium text-gray-900">{{ category.name }}</span>
          </div>
        </div>
      </BaseCard>

      <!-- Custom Categories -->
      <BaseCard title="Categorías personalizadas">
        <BaseEmpty
          v-if="store.customCategories.length === 0"
          title="No tienes categorías personalizadas"
          description="Crea categorías adicionales para organizar mejor tus gastos"
        />

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="category in store.customCategories"
            :key="category.id"
            class="flex items-center justify-between p-3 rounded-lg border border-gray-200"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: category.color + '20' }"
              >
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: category.color }"
                />
              </div>
              <span class="font-medium text-gray-900">{{ category.name }}</span>
            </div>

            <div class="flex items-center gap-1">
              <button
                class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                @click="handleEdit(category)"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                @click="handleDeleteClick(category)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Category Form Modal -->
      <BaseModal
        v-model="showForm"
        :title="isEditing ? 'Editar categoría' : 'Nueva categoría'"
      >
        <form @submit.prevent="handleSave" class="space-y-4">
          <div v-if="errors.general" class="p-3 rounded-lg bg-red-50 text-sm text-red-600">
            {{ errors.general }}
          </div>

          <BaseInput
            v-model="form.name"
            label="Nombre"
            placeholder="Ej: Suscripciones"
            :error="errors.name"
            required
          />

          <div>
            <label class="label">Color</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in CATEGORY_COLORS"
                :key="color"
                type="button"
                class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                :class="form.color === color ? 'border-gray-900 scale-110' : 'border-transparent'"
                :style="{ backgroundColor: color }"
                @click="form.color = color"
              />
            </div>
          </div>
        </form>

        <template #footer>
          <div class="flex justify-end gap-3">
            <BaseButton variant="secondary" @click="showForm = false">
              Cancelar
            </BaseButton>
            <BaseButton @click="handleSave">
              {{ isEditing ? 'Guardar cambios' : 'Crear categoría' }}
            </BaseButton>
          </div>
        </template>
      </BaseModal>

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
              Eliminar categoría
            </h3>
            <p class="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar "{{ categoryToDelete?.name }}"?
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
