import { supabase } from '@/config/supabase'
import type { SavingsBox, SavingsBoxFormData } from '@/types'

function toSavingsBox(row: any): SavingsBox {
  return {
    id: row.id,
    name: row.name,
    targetPercentage: row.target_percentage,
    currentBalance: row.current_balance,
    color: row.color,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export const savingsBoxesService = {
  async getAll(userId: string): Promise<SavingsBox[]> {
    const { data, error } = await supabase
      .from('savings_boxes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map(toSavingsBox)
  },

  async create(userId: string, data: SavingsBoxFormData): Promise<SavingsBox> {
    const { data: row, error } = await supabase
      .from('savings_boxes')
      .insert({
        user_id: userId,
        name: data.name,
        target_percentage: data.targetPercentage,
        current_balance: 0,
        color: data.color,
        is_active: data.isActive
      })
      .select()
      .single()

    if (error) throw error
    return toSavingsBox(row)
  },

  async update(userId: string, boxId: string, data: Partial<SavingsBoxFormData>): Promise<void> {
    const updateData: Record<string, any> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.targetPercentage !== undefined) updateData.target_percentage = data.targetPercentage
    if (data.color !== undefined) updateData.color = data.color
    if (data.isActive !== undefined) updateData.is_active = data.isActive

    const { error } = await supabase
      .from('savings_boxes')
      .update(updateData)
      .eq('id', boxId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async updateBalance(userId: string, boxId: string, amount: number): Promise<void> {
    const { data: box, error: fetchError } = await supabase
      .from('savings_boxes')
      .select('current_balance')
      .eq('id', boxId)
      .eq('user_id', userId)
      .single()

    if (fetchError) throw fetchError

    const { error } = await supabase
      .from('savings_boxes')
      .update({ current_balance: box.current_balance + amount })
      .eq('id', boxId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async delete(userId: string, boxId: string): Promise<void> {
    const { error } = await supabase
      .from('savings_boxes')
      .delete()
      .eq('id', boxId)
      .eq('user_id', userId)

    if (error) throw error
  }
}
