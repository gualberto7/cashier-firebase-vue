import type { Timestamp } from 'firebase/firestore'

export interface Expense {
  id: string
  amount: number
  description: string
  date: Date
  categoryId: string
  categoryName: string
  createdAt: Date
  updatedAt: Date
}

export interface ExpenseFormData {
  amount: number
  description: string
  date: Date
  categoryId: string
}

export interface ExpenseFirestore {
  amount: number
  description: string
  date: Timestamp
  categoryId: string
  categoryName: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ExpenseFilters {
  startDate?: Date
  endDate?: Date
  categoryId?: string
  minAmount?: number
  maxAmount?: number
}
