"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Calculator, RotateCcw } from "lucide-react"
import type { Participant } from "@/app/page"

interface ExpenseFormProps {
  participants: Participant[]
  onAddParticipant: () => void
  onUpdateParticipant: (id: string, field: keyof Participant, value: string | number) => void
  onRemoveParticipant: (id: string) => void
  onCalculate: () => void
  onReset: () => void
  isCalculating: boolean
}

export function ExpenseForm({
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
  onCalculate,
  onReset,
  isCalculating,
}: ExpenseFormProps) {
  const totalPaid = participants.reduce((sum, p) => sum + (p.amount_paid || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Participants</CardTitle>
        <CardDescription>Enter the name, email, and amount paid by each participant</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input
                    placeholder="John Doe"
                    value={participant.name}
                    onChange={(e) => onUpdateParticipant(participant.id, "name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={participant.email}
                    onChange={(e) => onUpdateParticipant(participant.id, "email", e.target.value)}
                  />
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
                />
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
          <Button
            onClick={onCalculate}
            disabled={isCalculating || participants.filter((p) => p.name && p.email).length < 2}
            className="flex-1"
          >
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
