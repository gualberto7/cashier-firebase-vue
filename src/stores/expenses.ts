import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { expensesService } from '@/services/expenses.service'
import { useAuthStore } from './auth'
import { useCategoriesStore } from './categories'
import type { Expense, ExpenseFormData, ExpenseFilters } from '@/types'

export const useExpensesStore = defineStore('expenses', () => {
  const expenses = ref<Expense[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ExpenseFilters>({})

  const authStore = useAuthStore()
  const categoriesStore = useCategoriesStore()

  const totalExpenses = computed(() =>
    expenses.value.reduce((sum, expense) => sum + expense.amount, 0)
  )

  const expensesByCategory = computed(() => {
    const byCategory = new Map<string, number>()
    for (const expense of expenses.value) {
      const current = byCategory.get(expense.categoryName) || 0
      byCategory.set(expense.categoryName, current + expense.amount)
    }
    return byCategory
  })

  async function fetchExpenses(newFilters?: ExpenseFilters) {
    if (!authStore.user) return

    if (newFilters) {
      filters.value = newFilters
    }

    isLoading.value = true
    error.value = null
    try {
      expenses.value = await expensesService.getAll(authStore.user.uid, filters.value)
    } catch (e: any) {
      error.value = e.message || 'Error al cargar los gastos'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createExpense(data: ExpenseFormData) {
    if (!authStore.user) return

    const category = categoriesStore.getCategoryById(data.categoryId)
    if (!category) {
      throw new Error('Categoría no encontrada')
    }

    isLoading.value = true
    error.value = null
    try {
      const newExpense = await expensesService.create(authStore.user.uid, data, category)
      expenses.value.unshift(newExpense)
      return newExpense
    } catch (e: any) {
      error.value = e.message || 'Error al crear el gasto'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateExpense(expenseId: string, data: Partial<ExpenseFormData>) {
    if (!authStore.user) return

    let category
    if (data.categoryId) {
      category = categoriesStore.getCategoryById(data.categoryId)
      if (!category) {
        throw new Error('Categoría no encontrada')
      }
    }

    isLoading.value = true
    error.value = null
    try {
      await expensesService.update(authStore.user.uid, expenseId, data, category)
      const index = expenses.value.findIndex(e => e.id === expenseId)
      if (index !== -1) {
        expenses.value[index] = {
          ...expenses.value[index],
          ...data,
          ...(category ? { categoryName: category.name } : {}),
          updatedAt: new Date()
        }
      }
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar el gasto'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteExpense(expenseId: string) {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      await expensesService.delete(authStore.user.uid, expenseId)
      expenses.value = expenses.value.filter(e => e.id !== expenseId)
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar el gasto'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(newFilters: ExpenseFilters) {
    filters.value = newFilters
  }

  function clearFilters() {
    filters.value = {}
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    expenses.value = []
    isLoading.value = false
    error.value = null
    filters.value = {}
  }

  return {
    expenses,
    isLoading,
    error,
    filters,
    totalExpenses,
    expensesByCategory,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    setFilters,
    clearFilters,
    clearError,
    $reset
  }
})
