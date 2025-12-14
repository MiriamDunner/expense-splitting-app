"use client"

import { useState } from "react"
import { ExpenseForm } from "@/components/expense-form"
import { SettlementSummary } from "@/components/settlement-summary"
import { Receipt, Sparkles } from "lucide-react"

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
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="rounded-lg bg-primary/10 p-2 ring-2 ring-primary/20">
              <Receipt className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Expense Splitter</h1>
          </div>
          <p
            className="animate-in fade-in slide-in-from-top-5 text-balance text-lg text-muted-foreground duration-700"
            style={{ animationDelay: "100ms" }}
          >
            Split expenses fairly and minimize transactions with our smart algorithm
          </p>
          <div
            className="animate-in fade-in slide-in-from-top-6 mx-auto mt-4 max-w-2xl rounded-lg bg-primary/5 p-3 text-sm text-muted-foreground duration-700"
            style={{ animationDelay: "200ms" }}
          >
            💡 <span className="font-medium">How it works:</span> Add everyone who participated, enter what each person
            paid, and we'll calculate the minimum number of payments needed to settle up.
          </div>
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
              <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card">
                <div className="text-center">
                  <div className="relative mb-6 inline-block">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Receipt className="h-16 w-16 text-primary" />
                    </div>
                    <Sparkles className="absolute -right-2 -top-2 h-8 w-8 animate-pulse text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-card-foreground">Ready to Calculate</h3>
                  <p className="text-balance text-sm text-muted-foreground">
                    Fill in the form on the left, then click{" "}
                    <span className="font-semibold text-primary">"Calculate Settlement"</span> to see who owes what
                  </p>
                  <div className="mt-6 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold">
                        1
                      </div>
                      <span>Name your event</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold">
                        2
                      </div>
                      <span>Add participants and amounts</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold">
                        3
                      </div>
                      <span>Calculate & send emails</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
