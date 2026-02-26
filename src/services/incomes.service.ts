import { supabase } from '@/config/supabase'
import type { Income, IncomeFormData, IncomeDistribution, SavingsBox } from '@/types'

function toIncome(row: any): Income {
  return {
    id: row.id,
    amount: row.amount,
    description: row.description,
    date: new Date(row.date),
    distributions: row.distributions ?? [],
    isDistributed: row.is_distributed,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export const incomesService = {
  async getAll(userId: string): Promise<Income[]> {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return (data ?? []).map(toIncome)
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

    const { data: incomeRow, error: incomeError } = await supabase
      .from('incomes')
      .insert({
        user_id: userId,
        amount: data.amount,
        description: data.description,
        date: data.date.toISOString(),
        distributions,
        is_distributed: true
      })
      .select()
      .single()

    if (incomeError) throw incomeError

    // Update each savings box balance
    for (const distribution of distributions) {
      const box = savingsBoxes.find(b => b.id === distribution.boxId)
      if (box) {
        const { error } = await supabase
          .from('savings_boxes')
          .update({ current_balance: box.currentBalance + distribution.amount })
          .eq('id', distribution.boxId)
          .eq('user_id', userId)

        if (error) throw error
      }
    }

    return toIncome(incomeRow)
  },

  async create(userId: string, data: IncomeFormData): Promise<Income> {
    const { data: row, error } = await supabase
      .from('incomes')
      .insert({
        user_id: userId,
        amount: data.amount,
        description: data.description,
        date: data.date.toISOString(),
        distributions: [],
        is_distributed: false
      })
      .select()
      .single()

    if (error) throw error
    return toIncome(row)
  },

  async update(userId: string, incomeId: string, data: Partial<IncomeFormData>): Promise<void> {
    const updateData: Record<string, any> = {}

    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.description !== undefined) updateData.description = data.description
    if (data.date) updateData.date = data.date.toISOString()

    const { error } = await supabase
      .from('incomes')
      .update(updateData)
      .eq('id', incomeId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async delete(userId: string, incomeId: string): Promise<void> {
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', incomeId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async getMonthlyTotal(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    const incomes = await this.getAll(userId)
    return incomes
      .filter(income => income.date >= startDate && income.date <= endDate)
      .reduce((sum, income) => sum + income.amount, 0)
  }
}
