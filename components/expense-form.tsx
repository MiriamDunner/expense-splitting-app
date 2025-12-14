"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Calculator, RotateCcw, User, Mail, DollarSign, Calendar } from "lucide-react"
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

    if (!eventName.trim()) {
      errors.push("Event name is required")
    }

    if (participants.length < 2) {
      errors.push("At least 2 participants are required")
    }

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
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Add Participants
        </CardTitle>
        <CardDescription>Enter the event name and participant details to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </div>
            <span className="font-medium">Name your event</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Event Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g., Weekend Trip, Dinner Party, Team Lunch"
            value={eventName}
            onChange={(e) => onEventNameChange(e.target.value)}
            className={`transition-all duration-200 ${!eventName.trim() ? "border-destructive/50" : "border-primary/50 focus:ring-2 focus:ring-primary/20"}`}
          />
          {eventName.trim() && (
            <p className="animate-in fade-in slide-in-from-top-1 flex items-center gap-1 text-xs text-primary">
              ✓ Event name set
            </p>
          )}
        </div>

        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </div>
            <span className="font-medium">Add participants and their expenses</span>
          </div>
        </div>

        <div className="space-y-4">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="animate-in fade-in slide-in-from-left-4 space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Participant {index + 1}
                  {participant.name.trim() && isValidEmail(participant.email) && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">✓ Complete</span>
                  )}
                </span>
                {participants.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveParticipant(participant.id)}
                    className="h-8 w-8 p-0 text-destructive transition-transform duration-200 hover:scale-110 hover:text-destructive"
                    title="Remove participant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={participant.name}
                    onChange={(e) => onUpdateParticipant(participant.id, "name", e.target.value)}
                    className={`transition-all duration-200 ${
                      !participant.name.trim()
                        ? "border-destructive/50"
                        : "border-primary/30 focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={participant.email}
                    onChange={(e) => onUpdateParticipant(participant.id, "email", e.target.value)}
                    className={`transition-all duration-200 ${
                      getEmailError(participant.email)
                        ? "border-destructive"
                        : !participant.email.trim()
                          ? "border-destructive/50"
                          : "border-primary/30 focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {getEmailError(participant.email) && (
                    <p className="animate-in fade-in slide-in-from-top-1 text-xs text-destructive">
                      ✗ Please enter a valid email address
                    </p>
                  )}
                  {!getEmailError(participant.email) && participant.email.trim() && (
                    <p className="animate-in fade-in slide-in-from-top-1 text-xs text-primary">✓ Valid email</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Amount Paid ($)
                  <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={participant.amount_paid || ""}
                  onChange={(e) =>
                    onUpdateParticipant(participant.id, "amount_paid", Number.parseFloat(e.target.value) || 0)
                  }
                  className={`transition-all duration-200 ${
                    participant.amount_paid < 0
                      ? "border-destructive"
                      : participant.amount_paid > 0
                        ? "border-primary/30 focus:ring-2 focus:ring-primary/20"
                        : ""
                  }`}
                />
                {participant.amount_paid < 0 && (
                  <p className="animate-in fade-in slide-in-from-top-1 text-xs text-destructive">
                    ✗ Amount cannot be negative
                  </p>
                )}
                {participant.amount_paid > 0 && (
                  <p className="animate-in fade-in slide-in-from-top-1 text-xs text-primary">
                    ✓ ${participant.amount_paid.toFixed(2)} paid
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={onAddParticipant}
          className="w-full border-dashed border-primary/50 bg-transparent transition-all duration-200 hover:scale-[1.02] hover:border-primary hover:bg-primary/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Participant
        </Button>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4 shadow-sm ring-1 ring-primary/20">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <DollarSign className="h-4 w-4" />
              Total Expense
            </span>
            <span className="text-2xl font-bold text-foreground">${totalPaid.toFixed(2)}</span>
          </div>
          {totalPaid > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Split between {participants.length} participants = ${(totalPaid / participants.length).toFixed(2)} per
              person
            </p>
          )}
        </div>

        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </div>
            <span className="font-medium text-muted-foreground">Calculate and send notifications</span>
          </div>
          {!isValid && (
            <p className="ml-8 mt-2 text-xs text-destructive">Please complete all required fields before calculating</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex-1 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
            title={!isValid ? "Please complete all required fields" : "Calculate who owes what"}
          >
            <Calculator className={`mr-2 h-4 w-4 ${isCalculating ? "animate-spin" : ""}`} />
            {isCalculating ? "Calculating..." : "Calculate Settlement"}
          </Button>

          <Button
            variant="outline"
            onClick={onReset}
            disabled={isCalculating}
            className="bg-transparent transition-transform duration-200 hover:scale-110"
            title="Reset form and start over"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
