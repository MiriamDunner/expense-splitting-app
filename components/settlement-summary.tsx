"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Send,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  User,
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
    try {
      const response = await fetch("/api/send-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settlement }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to send emails")
      }

      const result = await response.json()
      console.log("[v0] Email send result:", result)

      setEmailsSent(true)
      setTimeout(() => setEmailsSent(false), 3000)
    } catch (error) {
      console.error("[v0] Error sending emails:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      alert(
        `Failed to send email notifications: ${errorMessage}\n\nPlease check your RESEND_API_KEY environment variable.`,
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Settlement Summary
          </CardTitle>
          <CardDescription>Optimized transactions to settle all expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="animate-in zoom-in rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 p-4 shadow-sm transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 text-green-600" />
                Total Expense
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">${settlement.total_expense.toFixed(2)}</div>
            </div>

            <div
              className="animate-in zoom-in rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 shadow-sm transition-transform duration-300 hover:scale-105"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-blue-600" />
                Per Person Share
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">${settlement.per_person_share.toFixed(2)}</div>
            </div>
          </div>

          {settlement.transactions.length === 0 ? (
            <div className="animate-in zoom-in rounded-lg border border-green-500/20 bg-green-500/5 p-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
              <p className="text-sm font-medium text-foreground">All participants paid their fair share!</p>
              <p className="mt-1 text-xs text-muted-foreground">No transactions needed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                Required Transactions ({settlement.transactions.length})
              </h4>
              {settlement.transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="animate-in fade-in slide-in-from-left-4 flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium text-card-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {transaction.from_name}
                    </div>
                    <div className="text-sm text-muted-foreground">{transaction.from_email}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <ArrowRight className="h-5 w-5 animate-pulse text-primary" />
                  </div>

                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 font-medium text-card-foreground">
                      {transaction.to_name}
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">{transaction.to_email}</div>
                  </div>

                  <Badge className="ml-2 bg-gradient-to-r from-primary to-primary/80 text-base font-semibold">
                    ${transaction.amount.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Participant Breakdown
          </CardTitle>
          <CardDescription>Individual expense details for each participant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(settlement.summary).map(([email, info], index) => (
              <div
                key={email}
                className="animate-in fade-in slide-in-from-bottom-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-medium text-card-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {info.name}
                    </div>
                    <div className="text-sm text-muted-foreground">{email}</div>
                  </div>
                  {info.should_receive > 0 ? (
                    <Badge className="flex items-center gap-1 bg-green-600 text-white">
                      <TrendingUp className="h-3 w-3" />
                      Receives
                    </Badge>
                  ) : info.should_pay > 0 ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      Owes
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Even
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-secondary/50 p-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      Paid
                    </div>
                    <div className="font-semibold text-card-foreground">${info.amount_paid.toFixed(2)}</div>
                  </div>

                  {info.should_pay > 0 && (
                    <div className="rounded-lg bg-destructive/10 p-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingDown className="h-3 w-3" />
                        Should Pay
                      </div>
                      <div className="font-semibold text-destructive">${info.should_pay.toFixed(2)}</div>
                    </div>
                  )}

                  {info.should_receive > 0 && (
                    <div className="rounded-lg bg-green-500/10 p-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        Should Receive
                      </div>
                      <div className="font-semibold text-green-600">${info.should_receive.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="animate-in fade-in slide-in-from-bottom-2 border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full transition-all duration-300 hover:scale-[1.02]"
        size="lg"
        onClick={handleSendEmails}
        disabled={isSending || emailsSent}
      >
        {emailsSent ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4 animate-bounce" />
            Emails Sent!
          </>
        ) : (
          <>
            <Send className={`mr-2 h-4 w-4 ${isSending ? "animate-pulse" : ""}`} />
            {isSending ? "Sending..." : "Send Email Notifications"}
          </>
        )}
      </Button>
    </div>
  )
}
