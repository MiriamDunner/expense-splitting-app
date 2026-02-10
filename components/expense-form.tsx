"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Plus,
  Trash2,
  Calculator,
  RotateCcw,
  User,
  Mail,
  Coins,
  CalendarHeart,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react"
import type { Participant } from "@/app/page"

interface ExpenseFormProps {
  eventName: string
  onEventNameChange: (name: string) => void
  participants: Participant[]
  onAddParticipant: () => void
  onUpdateParticipant: (
    id: string,
    field: keyof Participant,
    value: string | number,
  ) => void
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
      errors.push("חובה למלא שם אירוע")
    }

    if (participants.length < 2) {
      errors.push("חובה להוסיף לפחות 2 משתתפים")
    }

    participants.forEach((participant, index) => {
      if (!participant.name.trim()) {
        errors.push(`משתתף ${index + 1}: חובה למלא שם`)
      }

      if (!participant.email.trim()) {
        errors.push(`משתתף ${index + 1}: חובה למלא מייל`)
      } else if (!isValidEmail(participant.email)) {
        errors.push(`משתתף ${index + 1}: כתובת מייל לא תקינה`)
      }

      if (participant.amount_paid < 0) {
        errors.push(`משתתף ${index + 1}: סכום לא יכול להיות שלילי`)
      }
    })

    if (totalPaid === 0) {
      errors.push("לפחות משתתף אחד צריך לשלם משהו")
    }

    return { isValid: errors.length === 0, errors }
  }

  const handleCalculate = () => {
    const validation = validateForm()
    if (!validation.isValid) {
      alert("יש לתקן את השגיאות הבאות:\n\n" + validation.errors.join("\n"))
      return
    }
    onCalculate()
  }

  const getEmailError = (email: string): boolean => {
    return email.trim() !== "" && !isValidEmail(email)
  }

  const isParticipantComplete = (p: Participant) =>
    p.name.trim() && p.email.trim() && isValidEmail(p.email)

  const { isValid } = validateForm()
  const completedCount = participants.filter(isParticipantComplete).length

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 overflow-hidden border-border/60 shadow-xl duration-500">
      <CardHeader className="bg-gradient-to-l from-primary/5 to-accent/5 pb-4">
        <CardTitle className="flex items-center gap-2.5 text-xl">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Users className="h-5 w-5 text-primary" />
          </div>
          {"הוסיפו משתתפים"}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {"הזינו את שם האירוע ופרטי המשתתפים כדי להתחיל"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {/* Step 1: Event Name */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
              1
            </div>
            <span className="text-sm font-medium text-foreground">{"שם האירוע"}</span>
          </div>

          <div className="relative">
            <CalendarHeart className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="לדוגמה: טיול סופ\"ש, ארוחת ערב, צהריים צוותי"
              value={eventName}
              onChange={(e) => onEventNameChange(e.target.value)}
              className={`pr-10 transition-all duration-300 ${
                !eventName.trim() ? "border-destructive/40 focus:border-destructive" : "border-primary/40 ring-2 ring-primary/10 focus:ring-primary/25"
              }`}
            />
          </div>
          {eventName.trim() && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-primary animate-in fade-in slide-in-from-top-1 duration-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {"שם האירוע הוגדר"}
            </p>
          )}
        </div>

        {/* Step 2: Participants */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
              2
            </div>
            <span className="text-sm font-medium text-foreground">{"פרטי משתתפים"}</span>
            {completedCount > 0 && (
              <span className="mr-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {completedCount}/{participants.length} {"הושלמו"}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className={`group relative space-y-3 rounded-xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom-3 ${
                  isParticipantComplete(participant)
                    ? "border-primary/30 bg-primary/[0.02]"
                    : "border-border/60 bg-card"
                }`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Participant header */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                      isParticipantComplete(participant)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {isParticipantComplete(participant) ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <User className="h-3.5 w-3.5" />
                      )}
                    </div>
                    {"משתתף"} {index + 1}
                  </span>
                  {participants.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveParticipant(participant.id)}
                      className="h-8 w-8 bg-transparent p-0 text-muted-foreground opacity-0 transition-all duration-200 hover:scale-110 hover:text-destructive group-hover:opacity-100"
                      title="הסרת משתתף"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <User className="h-3 w-3" />
                      {"שם"} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="ישראל ישראלי"
                      value={participant.name}
                      onChange={(e) =>
                        onUpdateParticipant(participant.id, "name", e.target.value)
                      }
                      className={`h-9 text-sm transition-all duration-200 ${
                        !participant.name.trim()
                          ? "border-destructive/30"
                          : "border-primary/30"
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {"מייל"} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="email"
                      dir="ltr"
                      placeholder="israel@example.com"
                      value={participant.email}
                      onChange={(e) =>
                        onUpdateParticipant(participant.id, "email", e.target.value)
                      }
                      className={`h-9 text-left text-sm transition-all duration-200 ${
                        getEmailError(participant.email)
                          ? "border-destructive ring-1 ring-destructive/20"
                          : !participant.email.trim()
                            ? "border-destructive/30"
                            : "border-primary/30"
                      }`}
                    />
                    {getEmailError(participant.email) && (
                      <p className="flex items-center gap-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="h-3 w-3" />
                        {"כתובת מייל לא תקינה"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Coins className="h-3 w-3" />
                    {"סכום ששולם"}
                    <span className="font-normal text-muted-foreground/70">{"(לא חובה)"}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      {"₪"}
                    </span>
                    <Input
                      type="number"
                      dir="ltr"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={participant.amount_paid || ""}
                      onChange={(e) =>
                        onUpdateParticipant(
                          participant.id,
                          "amount_paid",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      className={`h-9 pr-8 text-left text-sm transition-all duration-200 ${
                        participant.amount_paid < 0
                          ? "border-destructive"
                          : participant.amount_paid > 0
                            ? "border-primary/30 font-semibold"
                            : ""
                      }`}
                    />
                  </div>
                  {participant.amount_paid < 0 && (
                    <p className="flex items-center gap-1 text-xs text-destructive animate-in fade-in duration-200">
                      <AlertCircle className="h-3 w-3" />
                      {"סכום לא יכול להיות שלילי"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={onAddParticipant}
            className="w-full border-dashed border-primary/40 bg-transparent transition-all duration-300 hover:scale-[1.01] hover:border-primary hover:bg-primary/5"
          >
            <Plus className="ml-2 h-4 w-4" />
            {"הוסיפו משתתף נוסף"}
          </Button>
        </div>

        {/* Total */}
        <div className="overflow-hidden rounded-xl bg-gradient-to-l from-primary/10 via-primary/5 to-accent/10 p-4 shadow-sm ring-1 ring-primary/15 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Coins className="h-4 w-4 text-primary" />
              {"סה\"כ הוצאות"}
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {"₪"}{totalPaid.toFixed(2)}
            </span>
          </div>
          {totalPaid > 0 && participants.length >= 2 && (
            <p className="mt-2 text-xs text-muted-foreground animate-in fade-in duration-300">
              {"מחולק בין"} {participants.length} {"משתתפים"} = {"₪"}{(totalPaid / participants.length).toFixed(2)} {"לכל אחד"}
            </p>
          )}
        </div>

        {/* Step 3 */}
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
            3
          </div>
          <span className="text-sm font-medium text-foreground">{"חשבו ושלחו התראות"}</span>
          {!isValid && (
            <span className="mr-auto text-xs text-destructive">
              {"יש להשלים את כל השדות"}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleCalculate}
            disabled={isCalculating}
            size="lg"
            className="flex-1 bg-gradient-to-l from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
            title={!isValid ? "יש להשלים את כל השדות החובה" : "חשבו מי חייב למי"}
          >
            <Calculator className={`ml-2 h-5 w-5 ${isCalculating ? "animate-spin" : ""}`} />
            {isCalculating ? "מחשב..." : "חשב חלוקה"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onReset}
            disabled={isCalculating}
            className="bg-transparent transition-all duration-200 hover:scale-105"
            title="אפס טופס והתחל מחדש"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
