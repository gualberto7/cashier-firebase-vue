import { ref, computed } from 'vue'
import { useSavingsBoxesStore } from '@/stores/savingsBoxes'
import { expensesService } from '@/services/expenses.service'
import { incomesService } from '@/services/incomes.service'
import { useAuthStore } from '@/stores/auth'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { es } from 'date-fns/locale'

export type ReportMode = 'monthly' | 'trip'

export function useReports() {
  const authStore = useAuthStore()
  const savingsBoxesStore = useSavingsBoxesStore()

  const isLoading = ref(false)
  const selectedMonth = ref(new Date())
  const reportMode = ref<ReportMode>('monthly')
  const selectedTripId = ref<string | null>(null)

  const monthlyExpenses = ref(0)
  const monthlyIncomes = ref(0)
  const expensesByCategory = ref<Map<string, number>>(new Map())

  // Trip-specific state
  const tripTotal = ref(0)
  const tripExpenseCount = ref(0)

  const monthlyBalance = computed(() => monthlyIncomes.value - monthlyExpenses.value)

  const formattedMonth = computed(() =>
    format(selectedMonth.value, 'MMMM yyyy', { locale: es })
  )

  const categoryChartData = computed(() => {
    const labels: string[] = []
    const data: number[] = []
    const colors: string[] = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ]

    let colorIndex = 0
    expensesByCategory.value.forEach((amount, category) => {
      labels.push(category)
      data.push(amount)
      colorIndex++
    })

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0
      }]
    }
  })

  const savingsBoxesData = computed(() => {
    return savingsBoxesStore.boxes.map(box => ({
      name: box.name,
      balance: box.currentBalance,
      percentage: box.targetPercentage,
      color: box.color
    }))
  })

  async function loadMonthlyReport() {
    if (!authStore.user) return

    isLoading.value = true
    try {
      const startDate = startOfMonth(selectedMonth.value)
      const endDate = endOfMonth(selectedMonth.value)
      const year = selectedMonth.value.getFullYear()
      const month = selectedMonth.value.getMonth()

      const [expenses, incomes, byCategory] = await Promise.all([
        expensesService.getMonthlyTotal(authStore.user.uid, year, month),
        incomesService.getMonthlyTotal(authStore.user.uid, year, month),
        expensesService.getByCategory(authStore.user.uid, startDate, endDate)
      ])

      monthlyExpenses.value = expenses
      monthlyIncomes.value = incomes
      expensesByCategory.value = byCategory
    } finally {
      isLoading.value = false
    }
  }

  async function loadTripReport() {
    if (!authStore.user || !selectedTripId.value) return

    isLoading.value = true
    try {
      const expenses = await expensesService.getAll(authStore.user.uid, { tripId: selectedTripId.value })
      tripTotal.value = expenses.reduce((sum, e) => sum + e.amount, 0)
      tripExpenseCount.value = expenses.length

      const byCategory = new Map<string, number>()
      for (const expense of expenses) {
        const current = byCategory.get(expense.categoryName) || 0
        byCategory.set(expense.categoryName, current + expense.amount)
      }
      expensesByCategory.value = byCategory
    } finally {
      isLoading.value = false
    }
  }

  function setMonth(date: Date) {
    selectedMonth.value = date
    loadMonthlyReport()
  }

  function previousMonth() {
    const newDate = new Date(selectedMonth.value)
    newDate.setMonth(newDate.getMonth() - 1)
    setMonth(newDate)
  }

  function nextMonth() {
    const newDate = new Date(selectedMonth.value)
    newDate.setMonth(newDate.getMonth() + 1)
    setMonth(newDate)
  }

  function setReportMode(mode: ReportMode) {
    reportMode.value = mode
    expensesByCategory.value = new Map()
    if (mode === 'monthly') {
      loadMonthlyReport()
    } else {
      tripTotal.value = 0
      tripExpenseCount.value = 0
      selectedTripId.value = null
    }
  }

  function selectTrip(tripId: string) {
    selectedTripId.value = tripId
    loadTripReport()
  }

  return {
    isLoading,
    selectedMonth,
    reportMode,
    selectedTripId,
    monthlyExpenses,
    monthlyIncomes,
    monthlyBalance,
    tripTotal,
    tripExpenseCount,
    expensesByCategory,
    formattedMonth,
    categoryChartData,
    savingsBoxesData,
    loadMonthlyReport,
    loadTripReport,
    setMonth,
    previousMonth,
    nextMonth,
    setReportMode,
    selectTrip
  }
}
