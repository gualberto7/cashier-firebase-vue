import { supabase } from '@/config/supabase'
import type { Trip, TripFormData } from '@/types'
import { format } from 'date-fns'

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toTrip(row: any): Trip {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    startDate: parseLocalDate(row.start_date),
    endDate: row.end_date ? parseLocalDate(row.end_date) : null,
    color: row.color,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export const tripsService = {
  async getAll(userId: string): Promise<Trip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })

    if (error) throw error
    return (data ?? []).map(toTrip)
  },

  async create(userId: string, data: TripFormData): Promise<Trip> {
    const { data: row, error } = await supabase
      .from('trips')
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description || null,
        start_date: format(data.startDate, 'yyyy-MM-dd'),
        end_date: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : null,
        color: data.color
      })
      .select()
      .single()

    if (error) throw error
    return toTrip(row)
  },

  async update(userId: string, tripId: string, data: Partial<TripFormData>): Promise<void> {
    const updateData: Record<string, any> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description || null
    if (data.startDate !== undefined) updateData.start_date = format(data.startDate, 'yyyy-MM-dd')
    if ('endDate' in data) updateData.end_date = data.endDate ? format(data.endDate, 'yyyy-MM-dd') : null
    if (data.color !== undefined) updateData.color = data.color

    const { error } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', tripId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async delete(userId: string, tripId: string): Promise<void> {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async getTotal(userId: string, tripId: string): Promise<number> {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .eq('trip_id', tripId)

    if (error) throw error
    return (data ?? []).reduce((sum: number, row: any) => sum + Number(row.amount), 0)
  }
}
