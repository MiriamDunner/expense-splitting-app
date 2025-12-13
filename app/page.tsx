"use client"

import { useState } from "react"
import { ExpenseForm } from "@/components/expense-form"
import { SettlementSummary } from "@/components/settlement-summary"
import { Plus } from "lucide-react"

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

export default function Home() {
  const [eventName, setEventName] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([{ id: "1", name: "", email: "", amount_paid: 0 }])
  const [settlement, setSettlement] = useState<SettlementResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const addParticipant = () => {
    setParticipants([...participants, { id: Date.now().toString(), name: "", email: "", amount_paid: 0 }])
  }

  const updateParticipant = (id: string, field: keyof Participant, value: string | number) => {
    setParticipants(participants.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((p) => p.id !== id))
    }
  }

  const calculateSettlement = async () => {
    const validParticipants = participants.filter((p) => p.name && p.email)

    if (validParticipants.length < 2) {
      alert("Please add at least 2 participants with valid information")
      return
    }

    setIsCalculating(true)

    try {
      const response = await fetch("/api/calculate-settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: eventName || "Shared Expense",
          participants: validParticipants.map((p) => ({
            name: p.name,
            email: p.email,
            amount_paid: p.amount_paid,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to calculate settlement")

      const result = await response.json()
      setSettlement(result)
    } catch (error) {
      console.error("Error calculating settlement:", error)
      alert("Failed to calculate settlement. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  const resetForm = () => {
    setEventName("")
    setParticipants([{ id: "1", name: "", email: "", amount_paid: 0 }])
    setSettlement(null)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Expense Splitter</h1>
          <p className="text-lg text-muted-foreground">Split expenses fairly and minimize transactions</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <ExpenseForm
              eventName={eventName}
              onEventNameChange={setEventName}
              participants={participants}
              onAddParticipant={addParticipant}
              onUpdateParticipant={updateParticipant}
              onRemoveParticipant={removeParticipant}
              onCalculate={calculateSettlement}
              onReset={resetForm}
              isCalculating={isCalculating}
            />
          </div>

          <div className="space-y-6">
            {settlement ? (
              <SettlementSummary settlement={settlement} />
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-8">
                <div className="text-center">
                  <Plus className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-card-foreground">No Settlement Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Add participants and calculate to see the settlement summary
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
