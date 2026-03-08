export interface Participant {
  id: string
  name: string
  email: string
  amount_paid: number
}

export interface Transaction {
  from_name: string
  from_email: string
  to_name: string
  to_email: string
  amount: number
}

export interface SettlementResult {
  event_name: string
  total_expense: number
  per_person_share: number
  transactions: Transaction[]
  summary: Record<
    string,
    {
      name: string
      amount_paid: number
      should_pay: number
      should_receive: number
    }
  >
}
