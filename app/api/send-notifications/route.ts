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

function createEmailHTML(
  name: string,
  eventName: string,
  settlement: SettlementResult,
  email: string,
  info: any,
): string {
  const payments = settlement.transactions.filter(
    (t) => t.from_email === email,
  )
  const receipts = settlement.transactions.filter(
    (t) => t.to_email === email,
  )

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>סיכום חלוקת הוצאות - ${eventName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; direction: rtl;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">סיכום חלוקת הוצאות</h1>
              <p style="margin: 12px 0 0; color: #e0f2fe; font-size: 18px; font-weight: 500;">${eventName}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px 16px;">
              <p style="margin: 0; font-size: 20px; color: #1f2937; font-weight: 600;">היי ${name},</p>
              <p style="margin: 12px 0 0; font-size: 15px; color: #6b7280; line-height: 1.7;">הנה סיכום חלוקת ההוצאות עבור <strong>${eventName}</strong>.</p>
            </td>
          </tr>

          <!-- Summary Box -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">סה"כ הוצאות האירוע:</td>
                        <td align="left" style="padding: 10px 0; font-size: 16px; color: #1f2937; font-weight: 700;">₪${settlement.total_expense.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">החלק ההוגן שלך:</td>
                        <td align="left" style="padding: 10px 0; font-size: 16px; color: #1f2937; font-weight: 700;">₪${settlement.per_person_share.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">הסכום ששילמת:</td>
                        <td align="left" style="padding: 10px 0; font-size: 16px; color: #1f2937; font-weight: 700;">₪${info.amount_paid.toFixed(2)}</td>
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
              <div style="background-color: #fef2f2; border-right: 4px solid #ef4444; padding: 24px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; color: #991b1b; font-weight: 700;">עליך לשלם: ₪${info.should_pay.toFixed(2)}</h3>
                ${payments
                  .map(
                    (p) => `
                <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #fecaca;">
                  <div style="font-size: 16px; color: #1f2937; font-weight: 600; margin-bottom: 4px;">שלם ל${p.to_name}</div>
                  <div style="font-size: 14px; color: #6b7280; direction: ltr; text-align: right;">${p.to_email}</div>
                  <div style="font-size: 24px; color: #dc2626; font-weight: 800; margin-top: 10px;">₪${p.amount.toFixed(2)}</div>
                </div>
                `,
                  )
                  .join("")}
              </div>
              `
                  : info.should_receive > 0
                    ? `
              <div style="background-color: #f0fdf4; border-right: 4px solid #22c55e; padding: 24px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; color: #166534; font-weight: 700;">מגיע לך לקבל: ₪${info.should_receive.toFixed(2)}</h3>
                ${receipts
                  .map(
                    (r) => `
                <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #bbf7d0;">
                  <div style="font-size: 16px; color: #1f2937; font-weight: 600; margin-bottom: 4px;">קבל מ${r.from_name}</div>
                  <div style="font-size: 14px; color: #6b7280; direction: ltr; text-align: right;">${r.from_email}</div>
                  <div style="font-size: 24px; color: #16a34a; font-weight: 800; margin-top: 10px;">₪${r.amount.toFixed(2)}</div>
                </div>
                `,
                  )
                  .join("")}
              </div>
              `
                    : `
              <div style="background-color: #f0f9ff; border-right: 4px solid #0ea5e9; padding: 24px; border-radius: 10px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 12px;">&#x2705;</div>
                <h3 style="margin: 0; font-size: 18px; color: #075985; font-weight: 700;">הכל מיושב!</h3>
                <p style="margin: 8px 0 0; font-size: 14px; color: #0369a1;">התשלום שלך תואם בדיוק את החלק ההוגן שלך.</p>
              </div>
              `
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                המייל הזה נוצר על ידי <strong style="color: #0ea5e9;">מחלק הוצאות</strong>
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
  let message = `היי ${name},\n\n`
  message += `הנה סיכום חלוקת ההוצאות עבור "${eventName}":\n\n`
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  message += `סה"כ הוצאות האירוע: ₪${settlement.total_expense.toFixed(2)}\n`
  message += `החלק ההוגן שלך: ₪${settlement.per_person_share.toFixed(2)}\n`
  message += `הסכום ששילמת: ₪${info.amount_paid.toFixed(2)}\n`
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  if (info.should_pay > 0) {
    message += `עליך לשלם: ₪${info.should_pay.toFixed(2)}\n\n`
    const payments = settlement.transactions.filter(
      (t) => t.from_email === email,
    )
    for (const payment of payments) {
      message += `← שלם ₪${payment.amount.toFixed(2)} ל${payment.to_name}\n`
      message += `  מייל: ${payment.to_email}\n\n`
    }
  } else if (info.should_receive > 0) {
    message += `מגיע לך לקבל: ₪${info.should_receive.toFixed(2)}\n\n`
    const receipts = settlement.transactions.filter(
      (t) => t.to_email === email,
    )
    for (const receipt of receipts) {
      message += `→ קבל ₪${receipt.amount.toFixed(2)} מ${receipt.from_name}\n`
      message += `  מייל: ${receipt.from_email}\n\n`
    }
  } else {
    message += `הכל מיושב!\n`
    message += `התשלום שלך תואם בדיוק את החלק ההוגן שלך.\n\n`
  }

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  message += `המייל הזה נוצר על ידי מחלק הוצאות\n`

  return message
}

export async function POST(request: Request) {
  try {
    const { settlement }: { settlement: SettlementResult } =
      await request.json()

    if (!settlement) {
      return NextResponse.json(
        { error: "Settlement data is required" },
        { status: 400 },
      )
    }

    const eventName = settlement.event_name || "הוצאה משותפת"

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send emails to all participants
    const emailPromises = Object.entries(settlement.summary).map(
      async ([email, info]) => {
        const htmlContent = createEmailHTML(
          info.name,
          eventName,
          settlement,
          email,
          info,
        )
        const textContent = createEmailText(
          info.name,
          eventName,
          settlement,
          email,
          info,
        )

        try {
          const result = await resend.emails.send({
            from: "מחלק הוצאות <onboarding@resend.dev>",
            to: email,
            subject: `סיכום חלוקת הוצאות - ${eventName}`,
            html: htmlContent,
          })

          console.log(`[Email] Sent to ${email}:`, result.data?.id)
          return { email, success: true, id: result.data?.id }
        } catch (error: any) {
          console.error(`[Email] Failed to send to ${email}:`, error)
          return { email, success: false, error: error.message }
        }
      },
    )

    const results = await Promise.all(emailPromises)
    const successCount = results.filter((r) => r.success).length

    console.log(
      `[Email Summary] ${successCount}/${results.length} emails sent successfully`,
    )

    return NextResponse.json({
      success: true,
      message: `${successCount}/${results.length} מיילים נשלחו בהצלחה`,
      results,
    })
  } catch (error: any) {
    console.error("[Email] Error:", error)
    return NextResponse.json(
      { error: "שגיאה בשליחת התראות", details: error.message },
      { status: 500 },
    )
  }
}
