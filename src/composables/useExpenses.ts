import { computed, onMounted } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'
import type { ExpenseFormData, ExpenseFilters } from '@/types'

export function useExpenses() {
  const expensesStore = useExpensesStore()
  const categoriesStore = useCategoriesStore()

  const expenses = computed(() => expensesStore.expenses)
  const isLoading = computed(() => expensesStore.isLoading)
  const error = computed(() => expensesStore.error)
  const filters = computed(() => expensesStore.filters)
  const totalExpenses = computed(() => expensesStore.totalExpenses)
  const expensesByCategory = computed(() => expensesStore.expensesByCategory)
  const categories = computed(() => categoriesStore.categories)

  async function fetchExpenses(newFilters?: ExpenseFilters) {
    return expensesStore.fetchExpenses(newFilters)
  }

  async function createExpense(data: ExpenseFormData) {
    return expensesStore.createExpense(data)
  }

  async function updateExpense(expenseId: string, data: Partial<ExpenseFormData>) {
    return expensesStore.updateExpense(expenseId, data)
  }

  async function deleteExpense(expenseId: string) {
    return expensesStore.deleteExpense(expenseId)
  }

  function setFilters(newFilters: ExpenseFilters) {
    expensesStore.setFilters(newFilters)
  }

  function clearFilters() {
    expensesStore.clearFilters()
  }

  function clearError() {
    expensesStore.clearError()
  }

  onMounted(async () => {
    if (categories.value.length === 0) {
      await categoriesStore.fetchCategories()
    }
    if (expenses.value.length === 0) {
      await fetchExpenses()
    }
  })

  return {
    expenses,
    isLoading,
    error,
    filters,
    totalExpenses,
    expensesByCategory,
    categories,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    setFilters,
    clearFilters,
    clearError
  }
}
