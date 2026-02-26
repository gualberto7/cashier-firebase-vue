import { supabase } from '@/config/supabase'
import type { Expense, ExpenseFormData, ExpenseFilters, Category } from '@/types'

function toExpense(row: any): Expense {
  return {
    id: row.id,
    amount: row.amount,
    description: row.description,
    date: new Date(row.date),
    categoryId: row.category_id,
    categoryName: row.category_name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export const expensesService = {
  async getAll(userId: string, filters?: ExpenseFilters): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate.toISOString())
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate.toISOString())
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }
    if (filters?.minAmount !== undefined) {
      query = query.gte('amount', filters.minAmount)
    }
    if (filters?.maxAmount !== undefined) {
      query = query.lte('amount', filters.maxAmount)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map(toExpense)
  },

  async create(userId: string, data: ExpenseFormData, category: Category): Promise<Expense> {
    const { data: row, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        amount: data.amount,
        description: data.description,
        date: data.date.toISOString(),
        category_id: data.categoryId,
        category_name: category.name
      })
      .select()
      .single()

    if (error) throw error
    return toExpense(row)
  },

  async update(userId: string, expenseId: string, data: Partial<ExpenseFormData>, category?: Category): Promise<void> {
    const updateData: Record<string, any> = {}

    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.description !== undefined) updateData.description = data.description
    if (data.date) updateData.date = data.date.toISOString()
    if (data.categoryId) updateData.category_id = data.categoryId
    if (category) updateData.category_name = category.name

    const { error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', expenseId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async delete(userId: string, expenseId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async getMonthlyTotal(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    const expenses = await this.getAll(userId, { startDate, endDate })
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
