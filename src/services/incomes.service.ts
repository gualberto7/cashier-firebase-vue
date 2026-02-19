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
import type { Income, IncomeFormData, IncomeFirestore, IncomeDistribution, SavingsBox } from '@/types'

function getCollection(userId: string) {
  return collection(db, 'users', userId, 'incomes')
}

function toIncome(id: string, data: IncomeFirestore): Income {
  return {
    id,
    amount: data.amount,
    description: data.description,
    date: data.date.toDate(),
    distributions: data.distributions,
    isDistributed: data.isDistributed,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  }
}

export const incomesService = {
  async getAll(userId: string): Promise<Income[]> {
    const q = query(getCollection(userId), orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => toIncome(doc.id, doc.data() as IncomeFirestore))
  },

  calculateDistribution(amount: number, savingsBoxes: SavingsBox[]): IncomeDistribution[] {
    const activeBoxes = savingsBoxes.filter(box => box.isActive && box.targetPercentage > 0)

    return activeBoxes.map(box => ({
      boxId: box.id,
      boxName: box.name,
      percentage: box.targetPercentage,
      amount: Math.round((amount * box.targetPercentage / 100) * 100) / 100
    }))
  },

  async createWithDistribution(
    userId: string,
    data: IncomeFormData,
    savingsBoxes: SavingsBox[]
  ): Promise<Income> {
    const distributions = this.calculateDistribution(data.amount, savingsBoxes)
    const now = Timestamp.now()

    // Use batch write for atomic operation
    const batch = writeBatch(db)

    // Create income document
    const incomeRef = doc(getCollection(userId))
    const incomeData: IncomeFirestore = {
      amount: data.amount,
      description: data.description,
      date: Timestamp.fromDate(data.date),
      distributions,
      isDistributed: true,
      createdAt: now,
      updatedAt: now
    }
    batch.set(incomeRef, incomeData)

    // Update each savings box balance
    for (const distribution of distributions) {
      const boxRef = doc(db, 'users', userId, 'savingsBoxes', distribution.boxId)
      // Note: We can't use increment in batch, so we need to handle this differently
      // For now, we'll get the current balance and set the new value
      const box = savingsBoxes.find(b => b.id === distribution.boxId)
      if (box) {
        batch.update(boxRef, {
          currentBalance: box.currentBalance + distribution.amount,
          updatedAt: now
        })
      }
    }

    await batch.commit()

    return toIncome(incomeRef.id, incomeData)
  },

  async create(userId: string, data: IncomeFormData): Promise<Income> {
    const now = Timestamp.now()
    const docData: IncomeFirestore = {
      amount: data.amount,
      description: data.description,
      date: Timestamp.fromDate(data.date),
      distributions: [],
      isDistributed: false,
      createdAt: now,
      updatedAt: now
    }

    const docRef = await addDoc(getCollection(userId), docData)
    return toIncome(docRef.id, docData)
  },

  async update(userId: string, incomeId: string, data: Partial<IncomeFormData>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'incomes', incomeId)
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now()
    }

    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date)
    }

    await updateDoc(docRef, updateData)
  },

  async delete(userId: string, incomeId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'incomes', incomeId)
    await deleteDoc(docRef)
  },

  async getMonthlyTotal(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    const incomes = await this.getAll(userId)
    const filteredIncomes = incomes.filter(income => {
      return income.date >= startDate && income.date <= endDate
    })

    return filteredIncomes.reduce((sum, income) => sum + income.amount, 0)
  }
}
