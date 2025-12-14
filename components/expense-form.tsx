"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Calculator, RotateCcw } from "lucide-react"
import type { Participant } from "@/app/page"

interface ExpenseFormProps {
  eventName: string
  onEventNameChange: (name: string) => void
  participants: Participant[]
  onAddParticipant: () => void
  onUpdateParticipant: (id: string, field: keyof Participant, value: string | number) => void
  onRemoveParticipant: (id: string) => void
  onCalculate: () => void
  onReset: () => void
  isCalculating: boolean
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function ExpenseForm({
  eventName,
  onEventNameChange,
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
  onCalculate,
  onReset,
  isCalculating,
}: ExpenseFormProps) {
  const totalPaid = participants.reduce((sum, p) => sum + (p.amount_paid || 0), 0)

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Event name validation
    if (!eventName.trim()) {
      errors.push("Event name is required")
    }

    // At least 2 participants
    if (participants.length < 2) {
      errors.push("At least 2 participants are required")
    }

    // Validate each participant
    participants.forEach((participant, index) => {
      if (!participant.name.trim()) {
        errors.push(`Participant ${index + 1}: Name is required`)
      }

      if (!participant.email.trim()) {
        errors.push(`Participant ${index + 1}: Email is required`)
      } else if (!isValidEmail(participant.email)) {
        errors.push(`Participant ${index + 1}: Invalid email format`)
      }

      if (participant.amount_paid < 0) {
        errors.push(`Participant ${index + 1}: Amount cannot be negative`)
      }
    })

    // At least one person must have paid
    if (totalPaid === 0) {
      errors.push("At least one participant must have paid something")
    }

    return { isValid: errors.length === 0, errors }
  }

  const handleCalculate = () => {
    const validation = validateForm()
    if (!validation.isValid) {
      alert("Please fix the following errors:\n\n" + validation.errors.join("\n"))
      return
    }
    onCalculate()
  }

  const getEmailError = (email: string): boolean => {
    return email.trim() !== "" && !isValidEmail(email)
  }

  const { isValid } = validateForm()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Participants</CardTitle>
        <CardDescription>Enter the event name and participant details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Event Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g., Weekend Trip, Dinner Party, Team Lunch"
            value={eventName}
            onChange={(e) => onEventNameChange(e.target.value)}
            className={!eventName.trim() ? "border-destructive/50" : ""}
          />
        </div>

        <div className="space-y-4">
          {participants.map((participant, index) => (
            <div key={participant.id} className="space-y-3 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Participant {index + 1}</span>
                {participants.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveParticipant(participant.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={participant.name}
                    onChange={(e) => onUpdateParticipant(participant.id, "name", e.target.value)}
                    className={!participant.name.trim() ? "border-destructive/50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={participant.email}
                    onChange={(e) => onUpdateParticipant(participant.id, "email", e.target.value)}
                    className={
                      getEmailError(participant.email)
                        ? "border-destructive"
                        : !participant.email.trim()
                          ? "border-destructive/50"
                          : ""
                    }
                  />
                  {getEmailError(participant.email) && (
                    <p className="text-xs text-destructive">Please enter a valid email address</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Amount Paid ($)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={participant.amount_paid || ""}
                  onChange={(e) =>
                    onUpdateParticipant(participant.id, "amount_paid", Number.parseFloat(e.target.value) || 0)
                  }
                  className={participant.amount_paid < 0 ? "border-destructive" : ""}
                />
                {participant.amount_paid < 0 && <p className="text-xs text-destructive">Amount cannot be negative</p>}
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={onAddParticipant} className="w-full bg-transparent">
          <Plus className="mr-2 h-4 w-4" />
          Add Participant
        </Button>

        <div className="rounded-lg bg-secondary p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-secondary-foreground">Total Expense</span>
            <span className="text-2xl font-bold text-secondary-foreground">${totalPaid.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleCalculate} disabled={isCalculating} className="flex-1">
            <Calculator className="mr-2 h-4 w-4" />
            {isCalculating ? "Calculating..." : "Calculate Settlement"}
          </Button>

          <Button variant="outline" onClick={onReset} disabled={isCalculating}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
