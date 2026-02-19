import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoriesService } from '@/services/categories.service'
import { useAuthStore } from './auth'
import type { Category, CategoryFormData } from '@/types'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  const defaultCategories = computed(() => categories.value.filter(c => c.isDefault))
  const customCategories = computed(() => categories.value.filter(c => !c.isDefault))

  const getCategoryById = (id: string) => categories.value.find(c => c.id === id)

  async function fetchCategories() {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      // Initialize default categories if needed
      await categoriesService.initializeDefaultCategories(authStore.user.uid)
      categories.value = await categoriesService.getAll(authStore.user.uid)
    } catch (e: any) {
      error.value = e.message || 'Error al cargar las categorías'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(data: CategoryFormData) {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      const newCategory = await categoriesService.create(authStore.user.uid, data)
      categories.value.push(newCategory)
      categories.value.sort((a, b) => a.name.localeCompare(b.name))
      return newCategory
    } catch (e: any) {
      error.value = e.message || 'Error al crear la categoría'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateCategory(categoryId: string, data: Partial<CategoryFormData>) {
    if (!authStore.user) return

    const category = getCategoryById(categoryId)
    if (category?.isDefault) {
      throw new Error('No se pueden editar las categorías predefinidas')
    }

    isLoading.value = true
    error.value = null
    try {
      await categoriesService.update(authStore.user.uid, categoryId, data)
      const index = categories.value.findIndex(c => c.id === categoryId)
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], ...data, updatedAt: new Date() }
      }
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar la categoría'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCategory(categoryId: string) {
    if (!authStore.user) return

    const category = getCategoryById(categoryId)
    if (category?.isDefault) {
      throw new Error('No se pueden eliminar las categorías predefinidas')
    }

    isLoading.value = true
    error.value = null
    try {
      await categoriesService.delete(authStore.user.uid, categoryId)
      categories.value = categories.value.filter(c => c.id !== categoryId)
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar la categoría'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    categories.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    categories,
    isLoading,
    error,
    defaultCategories,
    customCategories,
    getCategoryById,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
    $reset
  }
})
