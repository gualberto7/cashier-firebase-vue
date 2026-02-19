import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { incomesService } from '@/services/incomes.service'
import { useAuthStore } from './auth'
import { useSavingsBoxesStore } from './savingsBoxes'
import type { Income, IncomeFormData, IncomeDistribution } from '@/types'

export const useIncomesStore = defineStore('incomes', () => {
  const incomes = ref<Income[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()
  const savingsBoxesStore = useSavingsBoxesStore()

  const totalIncomes = computed(() =>
    incomes.value.reduce((sum, income) => sum + income.amount, 0)
  )

  function calculatePreviewDistribution(amount: number): IncomeDistribution[] {
    return incomesService.calculateDistribution(amount, savingsBoxesStore.boxes)
  }

  async function fetchIncomes() {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      incomes.value = await incomesService.getAll(authStore.user.uid)
    } catch (e: any) {
      error.value = e.message || 'Error al cargar los ingresos'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createIncomeWithDistribution(data: IncomeFormData) {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      const newIncome = await incomesService.createWithDistribution(
        authStore.user.uid,
        data,
        savingsBoxesStore.boxes
      )

      // Update local savings box balances
      for (const distribution of newIncome.distributions) {
        savingsBoxesStore.updateBoxBalance(distribution.boxId, distribution.amount)
      }

      incomes.value.unshift(newIncome)
      return newIncome
    } catch (e: any) {
      error.value = e.message || 'Error al crear el ingreso'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createIncome(data: IncomeFormData) {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      const newIncome = await incomesService.create(authStore.user.uid, data)
      incomes.value.unshift(newIncome)
      return newIncome
    } catch (e: any) {
      error.value = e.message || 'Error al crear el ingreso'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateIncome(incomeId: string, data: Partial<IncomeFormData>) {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      await incomesService.update(authStore.user.uid, incomeId, data)
      const index = incomes.value.findIndex(i => i.id === incomeId)
      if (index !== -1) {
        incomes.value[index] = {
          ...incomes.value[index],
          ...data,
          updatedAt: new Date()
        }
      }
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar el ingreso'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteIncome(incomeId: string) {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      await incomesService.delete(authStore.user.uid, incomeId)
      incomes.value = incomes.value.filter(i => i.id !== incomeId)
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar el ingreso'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    incomes.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    incomes,
    isLoading,
    error,
    totalIncomes,
    calculatePreviewDistribution,
    fetchIncomes,
    createIncomeWithDistribution,
    createIncome,
    updateIncome,
    deleteIncome,
    clearError,
    $reset
  }
})
