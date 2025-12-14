"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Send, Users, DollarSign } from "lucide-react"
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settlement Summary</CardTitle>
          <CardDescription>Optimized transactions to settle all expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-secondary p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Total Expense
              </div>
              <div className="mt-1 text-2xl font-bold text-secondary-foreground">
                ${settlement.total_expense.toFixed(2)}
              </div>
            </div>

            <div className="rounded-lg bg-secondary p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Per Person Share
              </div>
              <div className="mt-1 text-2xl font-bold text-secondary-foreground">
                ${settlement.per_person_share.toFixed(2)}
              </div>
            </div>
          </div>

          {settlement.transactions.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                All participants paid their fair share. No transactions needed!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                Required Transactions ({settlement.transactions.length})
              </h4>
              {settlement.transactions.map((transaction, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                  <div className="flex-1">
                    <div className="font-medium text-card-foreground">{transaction.from_name}</div>
                    <div className="text-sm text-muted-foreground">{transaction.from_email}</div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-muted-foreground" />

                  <div className="flex-1 text-right">
                    <div className="font-medium text-card-foreground">{transaction.to_name}</div>
                    <div className="text-sm text-muted-foreground">{transaction.to_email}</div>
                  </div>

                  <Badge variant="secondary" className="ml-2 text-base font-semibold">
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
          <CardTitle>Participant Breakdown</CardTitle>
          <CardDescription>Individual expense details for each participant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(settlement.summary).map(([email, info]) => (
              <div key={email} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="font-medium text-card-foreground">{info.name}</div>
                    <div className="text-sm text-muted-foreground">{email}</div>
                  </div>
                  {info.should_receive > 0 ? (
                    <Badge variant="default" className="bg-green-600 text-white">
                      Receives
                    </Badge>
                  ) : info.should_pay > 0 ? (
                    <Badge variant="destructive">Owes</Badge>
                  ) : (
                    <Badge variant="secondary">Even</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Paid</div>
                    <div className="font-semibold text-card-foreground">${info.amount_paid.toFixed(2)}</div>
                  </div>

                  {info.should_pay > 0 && (
                    <div>
                      <div className="text-muted-foreground">Should Pay</div>
                      <div className="font-semibold text-destructive">${info.should_pay.toFixed(2)}</div>
                    </div>
                  )}

                  {info.should_receive > 0 && (
                    <div>
                      <div className="text-muted-foreground">Should Receive</div>
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
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Button className="w-full" size="lg" onClick={handleSendEmails} disabled={isSending || emailsSent}>
        <Send className="mr-2 h-4 w-4" />
        {isSending ? "Sending..." : emailsSent ? "Emails Sent!" : "Send Email Notifications"}
      </Button>
    </div>
  )
}
