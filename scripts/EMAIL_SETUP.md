# Email Notification Setup

## Overview

The expense splitter includes two email notification implementations:

1. **Next.js API Route** (`/api/send-notifications`) - For web app integration
2. **Python Script** (`send_email_notifications.py`) - Standalone email sender

## Next.js API Integration

The frontend includes a "Send Email Notifications" button that calls `/api/send-notifications`.

### Production Integration Options

To enable actual email sending in production, integrate with an email service:

#### Option 1: Resend (Recommended)

\`\`\`bash
npm install resend
\`\`\`

Add to your `.env`:
\`\`\`
RESEND_API_KEY=your_api_key_here
\`\`\`

Uncomment and use the Resend code in `app/api/send-notifications/route.ts`.

#### Option 2: SendGrid

\`\`\`bash
npm install @sendgrid/mail
\`\`\`

#### Option 3: Nodemailer

\`\`\`bash
npm install nodemailer
\`\`\`

## Python Email Script

### Setup SMTP (Gmail Example)

1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Set environment variables:

\`\`\`bash
export SMTP_FROM_EMAIL="your-email@gmail.com"
export SMTP_PASSWORD="your-app-specific-password"
export SMTP_SERVER="smtp.gmail.com"
export SMTP_PORT="587"
\`\`\`

### Run the Script

\`\`\`bash
python send_email_notifications.py
\`\`\`

## Email Message Format

Each participant receives a personalized email with:

- Total expense amount
- Their fair share
- Amount they paid
- **If they owe money:**
  - List of people to pay
  - Amount for each payment
- **If they should receive money:**
  - List of people who owe them
  - Amount from each person

## Development Mode

In development (without email credentials), the system logs emails to the console instead of sending them. This allows you to test the notification logic without setting up email infrastructure.

## Security Notes

- Never commit email credentials to version control
- Use environment variables for all sensitive data
- Consider using service-specific API keys over SMTP when possible
- Implement rate limiting for production email sending
