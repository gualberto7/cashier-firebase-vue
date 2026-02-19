import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { savingsBoxesService } from '@/services/savingsBoxes.service'
import { useAuthStore } from './auth'
import type { SavingsBox, SavingsBoxFormData } from '@/types'

export const useSavingsBoxesStore = defineStore('savingsBoxes', () => {
  const boxes = ref<SavingsBox[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  const activeBoxes = computed(() => boxes.value.filter(b => b.isActive))

  const totalPercentage = computed(() =>
    activeBoxes.value.reduce((sum, box) => sum + box.targetPercentage, 0)
  )

  const totalBalance = computed(() =>
    boxes.value.reduce((sum, box) => sum + box.currentBalance, 0)
  )

  const canAddPercentage = (percentage: number, excludeBoxId?: string) => {
    const currentTotal = activeBoxes.value
      .filter(b => b.id !== excludeBoxId)
      .reduce((sum, box) => sum + box.targetPercentage, 0)
    return currentTotal + percentage <= 100
  }

  async function fetchBoxes() {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      boxes.value = await savingsBoxesService.getAll(authStore.user.uid)
    } catch (e: any) {
      error.value = e.message || 'Error al cargar las cajas de ahorro'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createBox(data: SavingsBoxFormData) {
    if (!authStore.user) return

    if (data.isActive && !canAddPercentage(data.targetPercentage)) {
      throw new Error('La suma de porcentajes no puede exceder 100%')
    }

    isLoading.value = true
    error.value = null
    try {
      const newBox = await savingsBoxesService.create(authStore.user.uid, data)
      boxes.value.unshift(newBox)
      return newBox
    } catch (e: any) {
      error.value = e.message || 'Error al crear la caja de ahorro'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateBox(boxId: string, data: Partial<SavingsBoxFormData>) {
    if (!authStore.user) return

    if (data.isActive !== false && data.targetPercentage !== undefined) {
      if (!canAddPercentage(data.targetPercentage, boxId)) {
        throw new Error('La suma de porcentajes no puede exceder 100%')
      }
    }

    isLoading.value = true
    error.value = null
    try {
      await savingsBoxesService.update(authStore.user.uid, boxId, data)
      const index = boxes.value.findIndex(b => b.id === boxId)
      if (index !== -1) {
        boxes.value[index] = { ...boxes.value[index], ...data, updatedAt: new Date() }
      }
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar la caja de ahorro'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteBox(boxId: string) {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      await savingsBoxesService.delete(authStore.user.uid, boxId)
      boxes.value = boxes.value.filter(b => b.id !== boxId)
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar la caja de ahorro'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function updateBoxBalance(boxId: string, amount: number) {
    const index = boxes.value.findIndex(b => b.id === boxId)
    if (index !== -1) {
      boxes.value[index].currentBalance += amount
    }
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    boxes.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    boxes,
    isLoading,
    error,
    activeBoxes,
    totalPercentage,
    totalBalance,
    canAddPercentage,
    fetchBoxes,
    createBox,
    updateBox,
    deleteBox,
    updateBoxBalance,
    clearError,
    $reset
  }
})
