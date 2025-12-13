import { NextResponse } from "next/server"

interface Transaction {
  from_name: string
  from_email: string
  to_name: string
  to_email: string
  amount: number
}

interface SettlementResult {
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

export async function POST(request: Request) {
  try {
    const { settlement }: { settlement: SettlementResult } = await request.json()

    if (!settlement) {
      return NextResponse.json({ error: "Settlement data is required" }, { status: 400 })
    }

    // Generate email notifications for each participant
    const notifications: Array<{ email: string; subject: string; message: string }> = []

    // Create personalized emails for each participant
    for (const [email, info] of Object.entries(settlement.summary)) {
      let message = `Hi ${info.name},\n\n`
      message += `Here's your expense settlement summary:\n\n`
      message += `Total Event Expense: $${settlement.total_expense.toFixed(2)}\n`
      message += `Your Share: $${settlement.per_person_share.toFixed(2)}\n`
      message += `Amount You Paid: $${info.amount_paid.toFixed(2)}\n\n`

      if (info.should_pay > 0) {
        message += `You need to pay a total of $${info.should_pay.toFixed(2)}:\n\n`

        // Find transactions where this person needs to pay
        const payments = settlement.transactions.filter((t) => t.from_email === email)

        for (const payment of payments) {
          message += `• Pay $${payment.amount.toFixed(2)} to ${payment.to_name} (${payment.to_email})\n`
        }
      } else if (info.should_receive > 0) {
        message += `You should receive a total of $${info.should_receive.toFixed(2)}:\n\n`

        // Find transactions where this person should receive
        const receipts = settlement.transactions.filter((t) => t.to_email === email)

        for (const receipt of receipts) {
          message += `• Receive $${receipt.amount.toFixed(2)} from ${receipt.from_name} (${receipt.from_email})\n`
        }
      } else {
        message += `You're all settled up! Your payment matches your fair share.\n`
      }

      message += `\nThank you for using Expense Splitter!`

      notifications.push({
        email: email,
        subject: "Your Expense Settlement Summary",
        message: message,
      })
    }

    // In a production environment, you would integrate with an email service like:
    // - Resend (resend.com)
    // - SendGrid
    // - Amazon SES
    // - Nodemailer with SMTP

    // Example with Resend (commented out - requires API key):
    /*
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    for (const notification of notifications) {
      await resend.emails.send({
        from: 'Expense Splitter <noreply@yourdomain.com>',
        to: notification.email,
        subject: notification.subject,
        text: notification.message,
      });
    }
    */

    // For development/demo, log the emails that would be sent
    console.log("\n=== EMAIL NOTIFICATIONS ===")
    for (const notification of notifications) {
      console.log(`\nTo: ${notification.email}`)
      console.log(`Subject: ${notification.subject}`)
      console.log(`\n${notification.message}`)
      console.log("\n" + "=".repeat(50))
    }

    return NextResponse.json({
      success: true,
      message: `${notifications.length} email notifications prepared`,
      notifications: notifications.map((n) => ({ email: n.email, subject: n.subject })),
    })
  } catch (error) {
    console.error("Email notification error:", error)
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 })
  }
}
