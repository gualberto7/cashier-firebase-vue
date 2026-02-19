<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
      borderWidth: number
    }[]
  }
}

const props = defineProps<Props>()

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 15
      }
    }
  },
  cutout: '60%'
}

const hasData = computed(() =>
  props.data.datasets[0]?.data.length > 0
)
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Gastos por categoría</h3>

    <div v-if="hasData" class="h-64">
      <Doughnut :data="data" :options="chartOptions" />
    </div>

    <div v-else class="h-64 flex items-center justify-center text-gray-500">
      No hay datos para mostrar
    </div>
  </div>
</template>
