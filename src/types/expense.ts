export interface Expense {
  id: string
  amount: number
  description: string
  date: Date
  categoryId: string
  categoryName: string
  tripId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ExpenseFormData {
  amount: number
  description: string
  date: Date
  categoryId: string
  tripId?: string | null
}

export interface ExpenseFilters {
  startDate?: Date
  endDate?: Date
  categoryId?: string
  minAmount?: number
  maxAmount?: number
  tripId?: string
}
