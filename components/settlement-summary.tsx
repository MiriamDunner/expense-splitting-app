"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Send,
  Users,
  Coins,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  User,
  PartyPopper,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SettlementResult } from "@/app/page"
import { useState } from "react"

interface SettlementSummaryProps {
  settlement: SettlementResult
}

export function SettlementSummary({ settlement }: SettlementSummaryProps) {
  const [isSending, setIsSending] = useState(false)
  const [emailsSent, setEmailsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendEmails = async () => {
    setIsSending(true)
    setError(null)
    
    console.log("[EMAIL] Starting email send process...")
    console.log("[EMAIL] Settlement data:", settlement)
    
    try {
      const payload = { settlement }
      console.log("[EMAIL] Payload:", payload)
      
      const response = await fetch("/api/send-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log("[EMAIL] Response status:", response.status)
      console.log("[EMAIL] Response ok:", response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("[EMAIL] Error response:", errorData)
        throw new Error(errorData?.error || "Failed to send emails")
      }

      const result = await response.json()
      console.log("[EMAIL] Success! Result:", result)

      setEmailsSent(true)
      alert(`הצלחה! ${result.message}`)
      setTimeout(() => setEmailsSent(false), 4000)
    } catch (error) {
      console.error("[EMAIL] Error occurred:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      alert(
        `שגיאה בשליחת מיילים: ${errorMessage}\n\nבדקו את הקונסול לפרטים נוספים.`,
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Main Summary Card */}
      <Card className="overflow-hidden border-border/60 shadow-xl">
        <CardHeader className="bg-gradient-to-l from-primary/10 via-primary/5 to-accent/10 pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            {"סיכום חלוקה"}
          </CardTitle>
          <CardDescription className="text-sm">
            {"העברות מותאמות למינימום תשלומים"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="group rounded-xl bg-gradient-to-l from-green-500/10 to-green-600/5 p-4 ring-1 ring-green-500/10 transition-all duration-300 hover:shadow-md hover:shadow-green-500/5 animate-in zoom-in duration-400">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Coins className="h-4 w-4 text-green-600" />
                {"סה\"כ הוצאות"}
              </div>
              <div className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
                {"₪"}{settlement.total_expense.toFixed(2)}
              </div>
            </div>

            <div
              className="group rounded-xl bg-gradient-to-l from-blue-500/10 to-blue-600/5 p-4 ring-1 ring-blue-500/10 transition-all duration-300 hover:shadow-md hover:shadow-blue-500/5 animate-in zoom-in duration-400"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Users className="h-4 w-4 text-blue-600" />
                {"חלק לכל משתתף"}
              </div>
              <div className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
                {"₪"}{settlement.per_person_share.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Transactions */}
          {settlement.transactions.length === 0 ? (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-8 text-center ring-1 ring-green-500/10 animate-in zoom-in duration-400">
              <PartyPopper className="mx-auto mb-3 h-12 w-12 text-green-600" />
              <p className="text-base font-semibold text-foreground">
                {"כולם שילמו את החלק ההוגן שלהם!"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {"לא נדרשות העברות."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                {"העברות נדרשות"} ({settlement.transactions.length})
              </h4>
              {settlement.transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md animate-in fade-in slide-in-from-bottom-3 duration-400"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* From */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 font-medium text-card-foreground">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                        <User className="h-3.5 w-3.5 text-destructive" />
                      </div>
                      <span className="truncate">{transaction.from_name}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-col items-center gap-1">
                    <Badge className="bg-gradient-to-l from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm">
                      {"₪"}{transaction.amount.toFixed(2)}
                    </Badge>
                    <ArrowLeft className="h-4 w-4 text-primary animate-pulse" />
                  </div>

                  {/* To */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-end gap-2 font-medium text-card-foreground">
                      <span className="truncate">{transaction.to_name}</span>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                        <User className="h-3.5 w-3.5 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participant Breakdown */}
      <Card className="border-border/60 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Users className="h-4 w-4 text-primary" />
            </div>
            {"פירוט לפי משתתף"}
          </CardTitle>
          <CardDescription className="text-sm">
            {"כמה כל אחד שילם, וכמה הוא צריך לשלם או לקבל"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(settlement.summary).map(
              ([email, info], index) => (
                <div
                  key={email}
                  className="rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md animate-in fade-in slide-in-from-bottom-3 duration-400"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        info.should_receive > 0
                          ? "bg-green-500/10 text-green-600"
                          : info.should_pay > 0
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                      }`}>
                        {info.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-card-foreground">
                          {info.name}
                        </div>
                        <div dir="ltr" className="text-xs text-muted-foreground text-left">
                          {email}
                        </div>
                      </div>
                    </div>
                    {info.should_receive > 0 ? (
                      <Badge className="flex items-center gap-1 bg-green-600 text-green-50">
                        <TrendingUp className="h-3 w-3" />
                        {"מקבל"}
                      </Badge>
                    ) : info.should_pay > 0 ? (
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <TrendingDown className="h-3 w-3" />
                        {"חייב"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {"מיושב"}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-lg bg-secondary/40 p-2.5">
                      <div className="text-xs text-muted-foreground">{"שילם"}</div>
                      <div className="mt-0.5 font-semibold text-card-foreground">
                        {"₪"}{info.amount_paid.toFixed(2)}
                      </div>
                    </div>

                    {info.should_pay > 0 && (
                      <div className="rounded-lg bg-destructive/10 p-2.5">
                        <div className="text-xs text-muted-foreground">
                          {"צריך לשלם"}
                        </div>
                        <div className="mt-0.5 font-semibold text-destructive">
                          {"₪"}{info.should_pay.toFixed(2)}
                        </div>
                      </div>
                    )}

                    {info.should_receive > 0 && (
                      <div className="rounded-lg bg-green-500/10 p-2.5">
                        <div className="text-xs text-muted-foreground">
                          {"צריך לקבל"}
                        </div>
                        <div className="mt-0.5 font-semibold text-green-600">
                          {"₪"}{info.should_receive.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Send Button */}
      <Button
        className="w-full bg-gradient-to-l from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30"
        size="lg"
        onClick={handleSendEmails}
        disabled={isSending || emailsSent}
      >
        {emailsSent ? (
          <>
            <CheckCircle2 className="ml-2 h-5 w-5" />
            {"המיילים נשלחו בהצלחה!"}
          </>
        ) : isSending ? (
          <>
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            {"שולח..."}
          </>
        ) : (
          <>
            <Send className="ml-2 h-5 w-5" />
            {"שלחו התראות במייל"}
          </>
        )}
      </Button>
    </div>
  )
}
