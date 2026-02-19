import { computed, onMounted } from 'vue'
import { useIncomesStore } from '@/stores/incomes'
import { useSavingsBoxesStore } from '@/stores/savingsBoxes'
import type { IncomeFormData } from '@/types'

export function useIncomes() {
  const incomesStore = useIncomesStore()
  const savingsBoxesStore = useSavingsBoxesStore()

  const incomes = computed(() => incomesStore.incomes)
  const isLoading = computed(() => incomesStore.isLoading)
  const error = computed(() => incomesStore.error)
  const totalIncomes = computed(() => incomesStore.totalIncomes)
  const savingsBoxes = computed(() => savingsBoxesStore.boxes)
  const activeBoxes = computed(() => savingsBoxesStore.activeBoxes)

  function calculatePreviewDistribution(amount: number) {
    return incomesStore.calculatePreviewDistribution(amount)
  }

  async function fetchIncomes() {
    return incomesStore.fetchIncomes()
  }

  async function createIncomeWithDistribution(data: IncomeFormData) {
    return incomesStore.createIncomeWithDistribution(data)
  }

  async function createIncome(data: IncomeFormData) {
    return incomesStore.createIncome(data)
  }

  async function updateIncome(incomeId: string, data: Partial<IncomeFormData>) {
    return incomesStore.updateIncome(incomeId, data)
  }

  async function deleteIncome(incomeId: string) {
    return incomesStore.deleteIncome(incomeId)
  }

  function clearError() {
    incomesStore.clearError()
  }

  onMounted(async () => {
    if (savingsBoxes.value.length === 0) {
      await savingsBoxesStore.fetchBoxes()
    }
    if (incomes.value.length === 0) {
      await fetchIncomes()
    }
  })

  return {
    incomes,
    isLoading,
    error,
    totalIncomes,
    savingsBoxes,
    activeBoxes,
    calculatePreviewDistribution,
    fetchIncomes,
    createIncomeWithDistribution,
    createIncome,
    updateIncome,
    deleteIncome,
    clearError
  }
}
