import type { Timestamp } from 'firebase/firestore'

export interface SavingsBox {
  id: string
  name: string
  targetPercentage: number
  currentBalance: number
  color: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SavingsBoxFormData {
  name: string
  targetPercentage: number
  color: string
  isActive: boolean
}

export interface SavingsBoxFirestore {
  name: string
  targetPercentage: number
  currentBalance: number
  color: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const BOX_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
] as const
