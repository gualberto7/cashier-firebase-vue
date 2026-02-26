import { supabase } from '@/config/supabase'
import type { Category, CategoryFormData } from '@/types'
import { DEFAULT_CATEGORIES } from '@/types'

function toCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.is_default,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export const categoriesService = {
  async getAll(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) throw error
    return (data ?? []).map(toCategory)
  },

  async create(userId: string, data: CategoryFormData): Promise<Category> {
    const { data: row, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: data.name,
        icon: data.icon,
        color: data.color,
        is_default: false
      })
      .select()
      .single()

    if (error) throw error
    return toCategory(row)
  },

  async update(userId: string, categoryId: string, data: Partial<CategoryFormData>): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', categoryId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async delete(userId: string, categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async initializeDefaultCategories(userId: string): Promise<void> {
    const existing = await this.getAll(userId)
    if (existing.length > 0) return

    const { error } = await supabase
      .from('categories')
      .insert(
        DEFAULT_CATEGORIES.map(cat => ({
          user_id: userId,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          is_default: true
        }))
      )

    if (error) throw error
  }
}
