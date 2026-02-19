import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Expense, ExpenseFormData, ExpenseFirestore, ExpenseFilters, Category } from '@/types'

function getCollection(userId: string) {
  return collection(db, 'users', userId, 'expenses')
}

function toExpense(id: string, data: ExpenseFirestore): Expense {
  return {
    id,
    amount: data.amount,
    description: data.description,
    date: data.date.toDate(),
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  }
}

export const expensesService = {
  async getAll(userId: string, filters?: ExpenseFilters): Promise<Expense[]> {
    let q = query(getCollection(userId), orderBy('date', 'desc'))

    const constraints: any[] = []

    if (filters?.startDate) {
      constraints.push(where('date', '>=', Timestamp.fromDate(filters.startDate)))
    }

    if (filters?.endDate) {
      constraints.push(where('date', '<=', Timestamp.fromDate(filters.endDate)))
    }

    if (filters?.categoryId) {
      constraints.push(where('categoryId', '==', filters.categoryId))
    }

    if (constraints.length > 0) {
      q = query(getCollection(userId), ...constraints, orderBy('date', 'desc'))
    }

    const snapshot = await getDocs(q)
    let expenses = snapshot.docs.map((doc) => toExpense(doc.id, doc.data() as ExpenseFirestore))

    // Client-side filtering for amount (Firestore doesn't support range on multiple fields easily)
    if (filters?.minAmount !== undefined) {
      expenses = expenses.filter(e => e.amount >= filters.minAmount!)
    }

    if (filters?.maxAmount !== undefined) {
      expenses = expenses.filter(e => e.amount <= filters.maxAmount!)
    }

    return expenses
  },

  async create(userId: string, data: ExpenseFormData, category: Category): Promise<Expense> {
    const now = Timestamp.now()
    const docData: ExpenseFirestore = {
      amount: data.amount,
      description: data.description,
      date: Timestamp.fromDate(data.date),
      categoryId: data.categoryId,
      categoryName: category.name,
      createdAt: now,
      updatedAt: now
    }

    const docRef = await addDoc(getCollection(userId), docData)
    return toExpense(docRef.id, docData)
  },

  async update(userId: string, expenseId: string, data: Partial<ExpenseFormData>, category?: Category): Promise<void> {
    const docRef = doc(db, 'users', userId, 'expenses', expenseId)
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now()
    }

    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date)
    }

    if (category) {
      updateData.categoryName = category.name
    }

    await updateDoc(docRef, updateData)
  },

  async delete(userId: string, expenseId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'expenses', expenseId)
    await deleteDoc(docRef)
  },

  async getMonthlyTotal(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    const expenses = await this.getAll(userId, {
      startDate,
      endDate
    })

    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  },

  async getByCategory(userId: string, startDate: Date, endDate: Date): Promise<Map<string, number>> {
    const expenses = await this.getAll(userId, { startDate, endDate })
    const byCategory = new Map<string, number>()

    for (const expense of expenses) {
      const current = byCategory.get(expense.categoryName) || 0
      byCategory.set(expense.categoryName, current + expense.amount)
    }

    return byCategory
  }
}
