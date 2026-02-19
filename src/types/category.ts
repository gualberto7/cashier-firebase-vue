import type { Timestamp } from 'firebase/firestore'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CategoryFormData {
  name: string
  icon: string
  color: string
}

export interface CategoryFirestore {
  name: string
  icon: string
  color: string
  isDefault: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Alimentación', icon: 'shopping-cart', color: '#10b981', isDefault: true },
  { name: 'Transporte', icon: 'truck', color: '#3b82f6', isDefault: true },
  { name: 'Entretenimiento', icon: 'film', color: '#8b5cf6', isDefault: true },
  { name: 'Salud', icon: 'heart', color: '#ef4444', isDefault: true },
  { name: 'Educación', icon: 'academic-cap', color: '#f59e0b', isDefault: true },
  { name: 'Hogar', icon: 'home', color: '#ec4899', isDefault: true },
  { name: 'Servicios', icon: 'bolt', color: '#06b6d4', isDefault: true },
  { name: 'Otros', icon: 'ellipsis-horizontal', color: '#6b7280', isDefault: true },
]

export const CATEGORY_ICONS = [
  'shopping-cart',
  'truck',
  'film',
  'heart',
  'academic-cap',
  'home',
  'bolt',
  'ellipsis-horizontal',
  'gift',
  'credit-card',
  'banknotes',
  'briefcase',
  'phone',
  'computer-desktop',
  'building-office',
  'globe-alt',
] as const

export const CATEGORY_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#6b7280',
] as const
