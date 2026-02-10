"use client"

import { useState } from "react"
import { ExpenseForm } from "@/components/expense-form"
import { SettlementSummary } from "@/components/settlement-summary"
import { Receipt, Sparkles, ArrowDown } from "lucide-react"
import { ChatBox } from "@/components/chat/chat-box"

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
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "", email: "", amount_paid: 0 },
  ])
  const [settlement, setSettlement] = useState<SettlementResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { id: Date.now().toString(), name: "", email: "", amount_paid: 0 },
    ])
  }

  const updateParticipant = (
    id: string,
    field: keyof Participant,
    value: string | number,
  ) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    )
  }

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((p) => p.id !== id))
    }
  }

  const calculateSettlement = async () => {
    const validParticipants = participants.filter((p) => p.name && p.email)

    if (validParticipants.length < 2) {
      alert("יש להוסיף לפחות 2 משתתפים עם פרטים תקינים")
      return
    }

    setIsCalculating(true)

    try {
      const response = await fetch("/api/calculate-settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: eventName || "הוצאה משותפת",
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
      alert("שגיאה בחישוב. נסו שוב.")
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
      {/* Decorative floating shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-in zoom-in duration-1000" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl animate-in zoom-in duration-1000" style={{ animationDelay: "300ms" }} />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-primary/3 blur-3xl animate-in zoom-in duration-1000" style={{ animationDelay: "600ms" }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-5 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative rounded-2xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg shadow-primary/25">
              <Receipt className="h-9 w-9 text-primary-foreground" />
              <Sparkles className="absolute -top-1.5 -left-1.5 h-5 w-5 animate-pulse text-accent" />
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {"מחלק הוצאות"}
            </h1>
          </div>
          <p
            className="animate-in fade-in slide-in-from-top-5 mx-auto max-w-xl text-balance text-lg leading-relaxed text-muted-foreground duration-700"
            style={{ animationDelay: "100ms" }}
          >
            {"חלקו הוצאות בצורה הוגנת עם מינימום העברות בעזרת אלגוריתם חכם"}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form side */}
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

          {/* Results side */}
          <div className="space-y-6">
            {settlement ? (
              <SettlementSummary settlement={settlement} />
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-card/30 p-8 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:bg-card/60">
                <div className="text-center">
                  <div className="relative mb-6 inline-block animate-in zoom-in duration-500">
                    <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-5">
                      <Receipt className="h-14 w-14 text-primary" />
                    </div>
                    <Sparkles className="absolute -left-2 -top-2 h-7 w-7 animate-pulse text-accent" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                    {"מוכנים לחשב?"}
                  </h3>
                  <p className="mb-6 text-balance text-sm leading-relaxed text-muted-foreground">
                    {"מלאו את הטופס בצד ולחצו"}
                    {" "}
                    <span className="font-semibold text-primary">{"\"חשב חלוקה\""}</span>
                    {" "}
                    {"כדי לראות מי חייב למי"}
                  </p>
                  <div className="mx-auto max-w-[220px] space-y-3 text-right">
                    {[
                      "תנו שם לאירוע",
                      "הוסיפו משתתפים וסכומים",
                      "חשבו ושלחו מיילים",
                    ].map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
                        style={{ animationDelay: `${(i + 1) * 150}ms` }}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground shadow-sm">
                          {i + 1}
                        </div>
                        <span className="text-sm text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                  <ArrowDown className="mx-auto mt-6 h-5 w-5 animate-bounce text-muted-foreground/50" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Event Chat - visible once participants are added */}
        {participants.filter((p) => p.name.trim()).length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: "200ms" }}>
            <ChatBox
              eventId={eventName.trim() || "default-event"}
              participantNames={participants
                .filter((p) => p.name.trim())
                .map((p) => p.name.trim())}
            />
          </div>
        )}
      </div>
    </main>
  )
}
