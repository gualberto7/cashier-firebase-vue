export interface IncomeDistribution {
  boxId: string
  boxName: string
  percentage: number
  amount: number
}

export interface Income {
  id: string
  amount: number
  description: string
  date: Date
  distributions: IncomeDistribution[]
  isDistributed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IncomeFormData {
  amount: number
  description: string
  date: Date
}
