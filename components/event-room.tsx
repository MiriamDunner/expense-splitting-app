"use client"

import { useState, useCallback, useEffect } from "react"
import { ExpenseForm } from "@/components/expense-form"
import { SettlementSummary } from "@/components/settlement-summary"
import { EventTopBar } from "@/components/event-top-bar"
import { ChatPanel } from "@/components/chat/chat-panel"
import { Receipt, Sparkles, ArrowDown } from "lucide-react"

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

interface EventRoomProps {
  eventId: string
  eventName: string
  onLeave: () => void
}

export function EventRoom({ eventId, eventName, onLeave }: EventRoomProps) {
  const [localEventName, setLocalEventName] = useState(eventName)
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "", email: "", amount_paid: 0 },
  ])
  const [settlement, setSettlement] = useState<SettlementResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Sync participants to server
  const syncToServer = useCallback(
    async (parts: Participant[]) => {
      try {
        await fetch("/api/events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: eventId,
            participants: parts
              .filter((p) => p.name.trim())
              .map((p) => ({
                name: p.name,
                email: p.email,
                amount_paid: p.amount_paid,
              })),
          }),
        })
      } catch {
        // Silent fail for sync
      }
    },
    [eventId],
  )

  // Load existing event data on mount
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const res = await fetch(`/api/events?id=${eventId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.participants && data.participants.length > 0) {
            setParticipants(
              data.participants.map((p: { name: string; email: string; amount_paid: number }, i: number) => ({
                id: `loaded_${i}`,
                name: p.name,
                email: p.email,
                amount_paid: p.amount_paid,
              })),
            )
          }
        }
      } catch {
        // Silent fail
      }
    }
    loadEvent()
  }, [eventId])

  const addParticipant = () => {
    const updated = [
      ...participants,
      { id: Date.now().toString(), name: "", email: "", amount_paid: 0 },
    ]
    setParticipants(updated)
  }

  const updateParticipant = (
    id: string,
    field: keyof Participant,
    value: string | number,
  ) => {
    const updated = participants.map((p) =>
      p.id === id ? { ...p, [field]: value } : p,
    )
    setParticipants(updated)
    syncToServer(updated)
  }

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      const updated = participants.filter((p) => p.id !== id)
      setParticipants(updated)
      syncToServer(updated)
    }
  }

  const calculateSettlement = async () => {
    const validParticipants = participants.filter((p) => p.name && p.email)

    if (validParticipants.length < 2) {
      alert(
        "\u05D9\u05E9 \u05DC\u05D4\u05D5\u05E1\u05D9\u05E3 \u05DC\u05E4\u05D7\u05D5\u05EA 2 \u05DE\u05E9\u05EA\u05EA\u05E4\u05D9\u05DD \u05E2\u05DD \u05E4\u05E8\u05D8\u05D9\u05DD \u05EA\u05E7\u05D9\u05E0\u05D9\u05DD",
      )
      return
    }

    setIsCalculating(true)

    try {
      const response = await fetch("/api/calculate-settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: localEventName || "\u05D4\u05D5\u05E6\u05D0\u05D4 \u05DE\u05E9\u05D5\u05EA\u05E4\u05EA",
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
      alert("\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D7\u05D9\u05E9\u05D5\u05D1. \u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1.")
    } finally {
      setIsCalculating(false)
    }
  }

  const resetForm = () => {
    setParticipants([{ id: "1", name: "", email: "", amount_paid: 0 }])
    setSettlement(null)
    syncToServer([])
  }

  const namedParticipants = participants
    .filter((p) => p.name.trim())
    .map((p) => p.name.trim())

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative floating shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Top bar */}
      <EventTopBar
        eventName={localEventName}
        participantCount={namedParticipants.length}
        onLeave={onLeave}
      />

      {/* Main content */}
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form side */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ExpenseForm
              eventName={localEventName}
              onEventNameChange={setLocalEventName}
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "100ms" }}>
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
                    {"\u05DE\u05D5\u05DB\u05E0\u05D9\u05DD \u05DC\u05D7\u05E9\u05D1?"}
                  </h3>
                  <p className="mb-6 text-balance text-sm leading-relaxed text-muted-foreground">
                    {"\u05DE\u05DC\u05D0\u05D5 \u05D0\u05EA \u05D4\u05D8\u05D5\u05E4\u05E1 \u05D1\u05E6\u05D3 \u05D5\u05DC\u05D7\u05E6\u05D5"}{" "}
                    <span className="font-semibold text-primary">
                      {"\"\u05D7\u05E9\u05D1 \u05D7\u05DC\u05D5\u05E7\u05D4\""}
                    </span>{" "}
                    {"\u05DB\u05D3\u05D9 \u05DC\u05E8\u05D0\u05D5\u05EA \u05DE\u05D9 \u05D7\u05D9\u05D9\u05D1 \u05DC\u05DE\u05D9"}
                  </p>
                  <div className="mx-auto max-w-[220px] space-y-3 text-right">
                    {[
                      "\u05EA\u05E0\u05D5 \u05E9\u05DD \u05DC\u05D0\u05D9\u05E8\u05D5\u05E2",
                      "\u05D4\u05D5\u05E1\u05D9\u05E4\u05D5 \u05DE\u05E9\u05EA\u05EA\u05E4\u05D9\u05DD \u05D5\u05E1\u05DB\u05D5\u05DE\u05D9\u05DD",
                      "\u05D7\u05E9\u05D1\u05D5 \u05D5\u05E9\u05DC\u05D7\u05D5 \u05DE\u05D9\u05D9\u05DC\u05D9\u05DD",
                    ].map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
                        style={{ animationDelay: `${(i + 1) * 150}ms` }}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground shadow-sm">
                          {i + 1}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                  <ArrowDown className="mx-auto mt-6 h-5 w-5 animate-bounce text-muted-foreground/50" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Panel - floating side panel with identity */}
      {namedParticipants.length > 0 && (
        <ChatPanel
          eventId={eventId}
          participantNames={namedParticipants}
        />
      )}
    </div>
  )
}
