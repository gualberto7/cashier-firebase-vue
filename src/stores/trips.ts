import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tripsService } from '@/services/trips.service'
import { useAuthStore } from './auth'
import type { Trip, TripFormData } from '@/types'

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  const activeTrips = computed(() =>
    trips.value.filter(t => !t.endDate || t.endDate >= new Date())
  )

  async function fetchTrips() {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      trips.value = await tripsService.getAll(authStore.user.uid)
    } catch (e: any) {
      error.value = e.message || 'Error al cargar los viajes'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createTrip(data: TripFormData): Promise<Trip | undefined> {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      const newTrip = await tripsService.create(authStore.user.uid, data)
      trips.value.unshift(newTrip)
      return newTrip
    } catch (e: any) {
      error.value = e.message || 'Error al crear el viaje'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateTrip(tripId: string, data: Partial<TripFormData>) {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      await tripsService.update(authStore.user.uid, tripId, data)
      const index = trips.value.findIndex(t => t.id === tripId)
      if (index !== -1) {
        trips.value[index] = { ...trips.value[index], ...data, updatedAt: new Date() }
      }
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar el viaje'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTrip(tripId: string) {
    if (!authStore.user) return

    isLoading.value = true
    error.value = null
    try {
      await tripsService.delete(authStore.user.uid, tripId)
      trips.value = trips.value.filter(t => t.id !== tripId)
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar el viaje'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function getTripById(tripId: string): Trip | undefined {
    return trips.value.find(t => t.id === tripId)
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    trips.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    trips,
    isLoading,
    error,
    activeTrips,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    getTripById,
    clearError,
    $reset
  }
})
