import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Category, CategoryFormData, CategoryFirestore } from '@/types'
import { DEFAULT_CATEGORIES } from '@/types'

function getCollection(userId: string) {
  return collection(db, 'users', userId, 'categories')
}

function toCategory(id: string, data: CategoryFirestore): Category {
  return {
    id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    isDefault: data.isDefault,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  }
}

export const categoriesService = {
  async getAll(userId: string): Promise<Category[]> {
    const q = query(getCollection(userId), orderBy('name', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => toCategory(doc.id, doc.data() as CategoryFirestore))
  },

  async create(userId: string, data: CategoryFormData): Promise<Category> {
    const now = Timestamp.now()
    const docData: CategoryFirestore = {
      name: data.name,
      icon: data.icon,
      color: data.color,
      isDefault: false,
      createdAt: now,
      updatedAt: now
    }

    const docRef = await addDoc(getCollection(userId), docData)
    return toCategory(docRef.id, docData)
  },

  async update(userId: string, categoryId: string, data: Partial<CategoryFormData>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'categories', categoryId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    })
  },

  async delete(userId: string, categoryId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'categories', categoryId)
    await deleteDoc(docRef)
  },

  async initializeDefaultCategories(userId: string): Promise<void> {
    const existing = await this.getAll(userId)
    if (existing.length > 0) return

    const batch = writeBatch(db)
    const now = Timestamp.now()

    for (const category of DEFAULT_CATEGORIES) {
      const docRef = doc(getCollection(userId))
      batch.set(docRef, {
        ...category,
        createdAt: now,
        updatedAt: now
      })
    }

    await batch.commit()
  }
}
