<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MainLayout } from '@/components/layout'
import { BaseButton, BaseEmpty } from '@/components/common'
import { TripCard, TripForm } from '@/components/trips'
import { useTripsStore } from '@/stores/trips'
import { useAuthStore } from '@/stores/auth'
import { tripsService } from '@/services/trips.service'
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { Trip, TripFormData } from '@/types'

const tripsStore = useTripsStore()
const authStore = useAuthStore()

const showForm = ref(false)
const editingTrip = ref<Trip | null>(null)
const showDeleteConfirm = ref(false)
const tripToDelete = ref<Trip | null>(null)
const totals = ref<Map<string, number>>(new Map())
const isLoadingTotals = ref(false)

async function loadTotals() {
  if (!authStore.user || tripsStore.trips.length === 0) return
  isLoadingTotals.value = true
  try {
    const results = await Promise.all(
      tripsStore.trips.map(t =>
        tripsService.getTotal(authStore.user!.uid, t.id).then(total => ({ id: t.id, total }))
      )
    )
    const map = new Map<string, number>()
    for (const r of results) map.set(r.id, r.total)
    totals.value = map
  } finally {
    isLoadingTotals.value = false
  }
}

onMounted(async () => {
  await tripsStore.fetchTrips()
  await loadTotals()
})

function handleNew() {
  editingTrip.value = null
  showForm.value = true
}

function handleEdit(trip: Trip) {
  editingTrip.value = trip
  showForm.value = true
}

function handleDeleteClick(trip: Trip) {
  tripToDelete.value = trip
  showDeleteConfirm.value = true
}

async function handleSave(data: TripFormData) {
  if (editingTrip.value) {
    await tripsStore.updateTrip(editingTrip.value.id, data)
  } else {
    await tripsStore.createTrip(data)
    await loadTotals()
  }
  showForm.value = false
}

async function confirmDelete() {
  if (tripToDelete.value) {
    await tripsStore.deleteTrip(tripToDelete.value.id)
    totals.value.delete(tripToDelete.value.id)
    tripToDelete.value = null
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Viajes</h1>
          <p class="text-gray-500">{{ tripsStore.trips.length }} viaje{{ tripsStore.trips.length !== 1 ? 's' : '' }}</p>
        </div>
        <BaseButton @click="handleNew">
          <PlusIcon class="h-5 w-5 mr-1" />
          Nuevo viaje
        </BaseButton>
      </div>

      <div v-if="tripsStore.isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-100 rounded-xl h-32" />
      </div>

      <BaseEmpty
        v-else-if="tripsStore.trips.length === 0"
        title="No hay viajes"
        description="Crea un viaje para registrar gastos asociados"
      />

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TripCard
          v-for="trip in tripsStore.trips"
          :key="trip.id"
          :trip="trip"
          :total="totals.get(trip.id) ?? 0"
          @edit="handleEdit"
          @delete="handleDeleteClick"
        />
      </div>

      <TripForm
        v-model="showForm"
        :trip="editingTrip"
        @save="handleSave"
      />

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
              Eliminar viaje
            </h3>
            <p class="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar <strong>{{ tripToDelete?.name }}</strong>? Los gastos del viaje no se eliminarán.
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
