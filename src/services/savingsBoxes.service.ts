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
  increment
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { SavingsBox, SavingsBoxFormData, SavingsBoxFirestore } from '@/types'

function getCollection(userId: string) {
  return collection(db, 'users', userId, 'savingsBoxes')
}

function toSavingsBox(id: string, data: SavingsBoxFirestore): SavingsBox {
  return {
    id,
    name: data.name,
    targetPercentage: data.targetPercentage,
    currentBalance: data.currentBalance,
    color: data.color,
    isActive: data.isActive,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  }
}

export const savingsBoxesService = {
  async getAll(userId: string): Promise<SavingsBox[]> {
    const q = query(getCollection(userId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => toSavingsBox(doc.id, doc.data() as SavingsBoxFirestore))
  },

  async create(userId: string, data: SavingsBoxFormData): Promise<SavingsBox> {
    const now = Timestamp.now()
    const docData: SavingsBoxFirestore = {
      name: data.name,
      targetPercentage: data.targetPercentage,
      currentBalance: 0,
      color: data.color,
      isActive: data.isActive,
      createdAt: now,
      updatedAt: now
    }

    const docRef = await addDoc(getCollection(userId), docData)
    return toSavingsBox(docRef.id, docData)
  },

  async update(userId: string, boxId: string, data: Partial<SavingsBoxFormData>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'savingsBoxes', boxId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    })
  },

  async updateBalance(userId: string, boxId: string, amount: number): Promise<void> {
    const docRef = doc(db, 'users', userId, 'savingsBoxes', boxId)
    await updateDoc(docRef, {
      currentBalance: increment(amount),
      updatedAt: Timestamp.now()
    })
  },

  async delete(userId: string, boxId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'savingsBoxes', boxId)
    await deleteDoc(docRef)
  }
}
