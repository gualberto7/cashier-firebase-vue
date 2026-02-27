export interface Trip {
  id: string
  name: string
  description: string | null
  startDate: Date
  endDate: Date | null
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface TripFormData {
  name: string
  description: string
  startDate: Date
  endDate: Date | null
  color: string
}
