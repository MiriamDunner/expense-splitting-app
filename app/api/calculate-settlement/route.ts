import { NextResponse } from "next/server"

interface Participant {
  name: string
  email: string
  amount_paid: number
}

interface Transaction {
  from_name: string
  from_email: string
  to_name: string
  to_email: string
  amount: number
}

export async function POST(request: Request) {
  try {
    const { event_name, participants }: { event_name?: string; participants: Participant[] } = await request.json()

    if (!participants || participants.length < 2) {
      return NextResponse.json({ error: "At least 2 participants are required" }, { status: 400 })
    }

    // Calculate total expense and per-person share
    const total_expense = participants.reduce((sum, p) => sum + p.amount_paid, 0)
    const per_person_share = total_expense / participants.length

    // Calculate balance for each participant
    const balances = participants.map((p) => ({
      name: p.name,
      email: p.email,
      balance: p.amount_paid - per_person_share,
    }))

    // Separate creditors and debtors
    const creditors = balances.filter((b) => b.balance > 0.01).sort((a, b) => b.balance - a.balance)
    const debtors = balances.filter((b) => b.balance < -0.01).sort((a, b) => a.balance - b.balance)

    // Generate minimal transactions
    const transactions: Transaction[] = []
    let i = 0,
      j = 0

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i]
      const debtor = debtors[j]

      const amount = Math.min(creditor.balance, Math.abs(debtor.balance))

      if (amount > 0.01) {
        transactions.push({
          from_name: debtor.name,
          from_email: debtor.email,
          to_name: creditor.name,
          to_email: creditor.email,
          amount: Math.round(amount * 100) / 100,
        })
      }

      creditor.balance -= amount
      debtor.balance += amount

      if (creditor.balance < 0.01) i++
      if (Math.abs(debtor.balance) < 0.01) j++
    }

    // Create summary
    const summary: Record<string, any> = {}
    participants.forEach((p) => {
      summary[p.email] = {
        name: p.name,
        amount_paid: p.amount_paid,
        should_pay: Math.max(0, per_person_share - p.amount_paid),
        should_receive: Math.max(0, p.amount_paid - per_person_share),
      }
    })

    return NextResponse.json({
      event_name: event_name || "Shared Expense",
      total_expense: Math.round(total_expense * 100) / 100,
      per_person_share: Math.round(per_person_share * 100) / 100,
      transactions,
      summary,
    })
  } catch (error) {
    console.error("Settlement calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate settlement" }, { status: 500 })
  }
}
