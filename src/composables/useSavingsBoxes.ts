import { computed, onMounted } from 'vue'
import { useSavingsBoxesStore } from '@/stores/savingsBoxes'
import type { SavingsBoxFormData } from '@/types'

export function useSavingsBoxes() {
  const store = useSavingsBoxesStore()

  const boxes = computed(() => store.boxes)
  const activeBoxes = computed(() => store.activeBoxes)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const totalPercentage = computed(() => store.totalPercentage)
  const totalBalance = computed(() => store.totalBalance)
  const remainingPercentage = computed(() => 100 - store.totalPercentage)

  async function fetchBoxes() {
    return store.fetchBoxes()
  }

  async function createBox(data: SavingsBoxFormData) {
    return store.createBox(data)
  }

  async function updateBox(boxId: string, data: Partial<SavingsBoxFormData>) {
    return store.updateBox(boxId, data)
  }

  async function deleteBox(boxId: string) {
    return store.deleteBox(boxId)
  }

  function canAddPercentage(percentage: number, excludeBoxId?: string) {
    return store.canAddPercentage(percentage, excludeBoxId)
  }

  function clearError() {
    store.clearError()
  }

  onMounted(() => {
    if (boxes.value.length === 0) {
      fetchBoxes()
    }
  })

  return {
    boxes,
    activeBoxes,
    isLoading,
    error,
    totalPercentage,
    totalBalance,
    remainingPercentage,
    fetchBoxes,
    createBox,
    updateBox,
    deleteBox,
    canAddPercentage,
    clearError
  }
}
