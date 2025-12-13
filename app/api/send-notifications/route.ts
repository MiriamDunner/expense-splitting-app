import { NextResponse } from "next/server"
import { Resend } from "resend"

interface Transaction {
  from_name: string
  from_email: string
  to_name: string
  to_email: string
  amount: number
}

interface SettlementResult {
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

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function createEmailHTML(
  name: string,
  eventName: string,
  settlement: SettlementResult,
  email: string,
  info: any,
): string {
  const payments = settlement.transactions.filter((t) => t.from_email === email)
  const receipts = settlement.transactions.filter((t) => t.to_email === email)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Expense Settlement - ${eventName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">💰 Expense Settlement</h1>
              <p style="margin: 10px 0 0; color: #e0f2fe; font-size: 16px;">${eventName}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <p style="margin: 0; font-size: 18px; color: #1f2937; font-weight: 600;">Hi ${name},</p>
              <p style="margin: 15px 0 0; font-size: 15px; color: #6b7280; line-height: 1.6;">Here's your expense settlement summary for <strong>${eventName}</strong>.</p>
            </td>
          </tr>

          <!-- Summary Box -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Total Event Expense:</td>
                        <td align="right" style="padding: 8px 0; font-size: 14px; color: #1f2937; font-weight: 600;">$${settlement.total_expense.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Your Fair Share:</td>
                        <td align="right" style="padding: 8px 0; font-size: 14px; color: #1f2937; font-weight: 600;">$${settlement.per_person_share.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Amount You Paid:</td>
                        <td align="right" style="padding: 8px 0; font-size: 14px; color: #1f2937; font-weight: 600;">$${info.amount_paid.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Transactions -->
          <tr>
            <td style="padding: 0 40px 30px;">
              ${
                info.should_pay > 0
                  ? `
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px; font-size: 16px; color: #991b1b; font-weight: 600;">You Need to Pay: $${info.should_pay.toFixed(2)}</h3>
                ${payments
                  .map(
                    (p) => `
                <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #fecaca;">
                  <div style="font-size: 15px; color: #1f2937; font-weight: 600; margin-bottom: 5px;">Pay ${p.to_name}</div>
                  <div style="font-size: 14px; color: #6b7280;">${p.to_email}</div>
                  <div style="font-size: 20px; color: #dc2626; font-weight: 700; margin-top: 8px;">$${p.amount.toFixed(2)}</div>
                </div>
                `,
                  )
                  .join("")}
              </div>
              `
                  : info.should_receive > 0
                    ? `
              <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px; font-size: 16px; color: #166534; font-weight: 600;">You Should Receive: $${info.should_receive.toFixed(2)}</h3>
                ${receipts
                  .map(
                    (r) => `
                <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #bbf7d0;">
                  <div style="font-size: 15px; color: #1f2937; font-weight: 600; margin-bottom: 5px;">Receive from ${r.from_name}</div>
                  <div style="font-size: 14px; color: #6b7280;">${r.from_email}</div>
                  <div style="font-size: 20px; color: #16a34a; font-weight: 700; margin-top: 8px;">$${r.amount.toFixed(2)}</div>
                </div>
                `,
                  )
                  .join("")}
              </div>
              `
                    : `
              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 6px; text-align: center;">
                <div style="font-size: 28px; margin-bottom: 10px;">✅</div>
                <h3 style="margin: 0; font-size: 16px; color: #075985; font-weight: 600;">You're All Settled Up!</h3>
                <p style="margin: 8px 0 0; font-size: 14px; color: #0369a1;">Your payment matches your fair share perfectly.</p>
              </div>
              `
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                This email was generated by <strong style="color: #0ea5e9;">Expense Splitter</strong>
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #d1d5db;">
                Questions? Just reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function createEmailText(
  name: string,
  eventName: string,
  settlement: SettlementResult,
  email: string,
  info: any,
): string {
  let message = `Hi ${name},\n\n`
  message += `Here's your expense settlement summary for "${eventName}":\n\n`
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  message += `Total Event Expense: $${settlement.total_expense.toFixed(2)}\n`
  message += `Your Fair Share: $${settlement.per_person_share.toFixed(2)}\n`
  message += `Amount You Paid: $${info.amount_paid.toFixed(2)}\n`
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  if (info.should_pay > 0) {
    message += `💳 YOU NEED TO PAY: $${info.should_pay.toFixed(2)}\n\n`
    const payments = settlement.transactions.filter((t) => t.from_email === email)
    for (const payment of payments) {
      message += `→ Pay $${payment.amount.toFixed(2)} to ${payment.to_name}\n`
      message += `  Email: ${payment.to_email}\n\n`
    }
  } else if (info.should_receive > 0) {
    message += `💰 YOU SHOULD RECEIVE: $${info.should_receive.toFixed(2)}\n\n`
    const receipts = settlement.transactions.filter((t) => t.to_email === email)
    for (const receipt of receipts) {
      message += `← Receive $${receipt.amount.toFixed(2)} from ${receipt.from_name}\n`
      message += `  Email: ${receipt.from_email}\n\n`
    }
  } else {
    message += `✅ YOU'RE ALL SETTLED UP!\n`
    message += `Your payment matches your fair share perfectly.\n\n`
  }

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  message += `This email was generated by Expense Splitter\n`

  return message
}

export async function POST(request: Request) {
  try {
    const { settlement }: { settlement: SettlementResult } = await request.json()

    if (!settlement) {
      return NextResponse.json({ error: "Settlement data is required" }, { status: 400 })
    }

    const eventName = settlement.event_name || "Shared Expense"
    console.log("[v0] Starting email send process for event:", eventName)
    console.log("[v0] Resend client initialized:", !!resend)

    if (resend) {
      console.log("[v0] Sending real emails via Resend...")
      const emailPromises = Object.entries(settlement.summary).map(async ([email, info]) => {
        const htmlContent = createEmailHTML(info.name, eventName, settlement, email, info)
        const textContent = createEmailText(info.name, eventName, settlement, email, info)

        try {
          const result = await resend.emails.send({
            from: "Expense Splitter <onboarding@resend.dev>",
            to: email,
            subject: `💰 Settlement for ${eventName}`,
            html: htmlContent,
            text: textContent,
          })
          console.log("[v0] Email sent successfully to:", email, "ID:", result.data?.id)
          return { email, success: true, id: result.data?.id }
        } catch (error: any) {
          console.error("[v0] Failed to send email to:", email, error)
          return { email, success: false, error: error.message }
        }
      })

      const results = await Promise.all(emailPromises)
      const successCount = results.filter((r) => r.success).length

      return NextResponse.json({
        success: true,
        message: `${successCount}/${results.length} emails sent successfully`,
        results,
      })
    } else {
      console.log("\n" + "=".repeat(80))
      console.log("📧 EMAIL PREVIEW MODE (No RESEND_API_KEY configured)")
      console.log("=".repeat(80))

      for (const [email, info] of Object.entries(settlement.summary)) {
        const textContent = createEmailText(info.name, eventName, settlement, email, info)
        console.log("\n" + "-".repeat(80))
        console.log(`TO: ${email}`)
        console.log(`SUBJECT: 💰 Settlement for ${eventName}`)
        console.log("-".repeat(80))
        console.log(textContent)
      }

      console.log("\n" + "=".repeat(80))
      console.log("💡 To send real emails, add RESEND_API_KEY to your environment variables")
      console.log("=".repeat(80) + "\n")

      return NextResponse.json({
        success: true,
        mode: "preview",
        message: `${Object.keys(settlement.summary).length} email previews logged to console`,
        note: "Add RESEND_API_KEY environment variable to send real emails",
      })
    }
  } catch (error: any) {
    console.error("[v0] Email notification error:", error)
    return NextResponse.json({ error: "Failed to send notifications", details: error.message }, { status: 500 })
  }
}
