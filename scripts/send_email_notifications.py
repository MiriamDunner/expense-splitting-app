"""
Email notification service for expense settlement.
This script can be integrated with the FastAPI backend to send emails.
"""

from typing import List, Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


def create_email_message(
    participant_email: str,
    participant_name: str,
    info: Dict,
    total_expense: float,
    per_person_share: float,
    transactions: List[Dict],
) -> str:
    """Generate personalized email message for a participant."""
    
    message = f"Hi {participant_name},\n\n"
    message += "Here's your expense settlement summary:\n\n"
    message += f"Total Event Expense: ${total_expense:.2f}\n"
    message += f"Your Share: ${per_person_share:.2f}\n"
    message += f"Amount You Paid: ${info['amount_paid']:.2f}\n\n"

    if info["should_pay"] > 0:
        message += f"You need to pay a total of ${info['should_pay']:.2f}:\n\n"
        
        # Find transactions where this person needs to pay
        payments = [t for t in transactions if t["from_email"] == participant_email]
        
        for payment in payments:
            message += f"• Pay ${payment['amount']:.2f} to {payment['to_name']} ({payment['to_email']})\n"
    
    elif info["should_receive"] > 0:
        message += f"You should receive a total of ${info['should_receive']:.2f}:\n\n"
        
        # Find transactions where this person should receive
        receipts = [t for t in transactions if t["to_email"] == participant_email]
        
        for receipt in receipts:
            message += f"• Receive ${receipt['amount']:.2f} from {receipt['from_name']} ({receipt['from_email']})\n"
    
    else:
        message += "You're all settled up! Your payment matches your fair share.\n"

    message += "\nThank you for using Expense Splitter!"
    
    return message


def send_email_smtp(
    to_email: str,
    subject: str,
    body: str,
    smtp_server: str = "smtp.gmail.com",
    smtp_port: int = 587,
    from_email: str = None,
    password: str = None,
) -> bool:
    """
    Send email using SMTP.
    
    Note: For Gmail, you need to:
    1. Enable 2-factor authentication
    2. Generate an app-specific password
    3. Use that password here
    """
    
    if not from_email or not password:
        print("Warning: Email credentials not provided. Email not sent.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg["From"] = from_email
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Connect to SMTP server and send
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(from_email, password)
        server.send_message(msg)
        server.quit()
        
        print(f"✓ Email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"✗ Failed to send email to {to_email}: {str(e)}")
        return False


def send_notifications(settlement_data: Dict) -> List[Dict]:
    """
    Send email notifications to all participants.
    
    Args:
        settlement_data: Settlement result from the calculation
        
    Returns:
        List of notification results
    """
    
    notifications = []
    
    # Get email credentials from environment variables
    from_email = os.getenv("SMTP_FROM_EMAIL")
    password = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    
    for email, info in settlement_data["summary"].items():
        # Create personalized message
        message = create_email_message(
            participant_email=email,
            participant_name=info["name"],
            info=info,
            total_expense=settlement_data["total_expense"],
            per_person_share=settlement_data["per_person_share"],
            transactions=settlement_data["transactions"],
        )
        
        subject = "Your Expense Settlement Summary"
        
        # Send email (or print for demo)
        if from_email and password:
            success = send_email_smtp(
                to_email=email,
                subject=subject,
                body=message,
                smtp_server=smtp_server,
                smtp_port=smtp_port,
                from_email=from_email,
                password=password,
            )
        else:
            # Demo mode: just print the email
            print(f"\n{'='*60}")
            print(f"To: {email}")
            print(f"Subject: {subject}")
            print(f"\n{message}")
            print(f"{'='*60}\n")
            success = True
        
        notifications.append({
            "email": email,
            "name": info["name"],
            "subject": subject,
            "sent": success,
        })
    
    # Return summary with statistics
    successful = sum(1 for n in notifications if n["sent"])
    return {
        "success": True,
        "total": len(notifications),
        "sent": successful,
        "notifications": notifications,
        "message": f"Email notifications sent to {successful}/{len(notifications)} participants"
    }


# Example usage
if __name__ == "__main__":
    # Sample settlement data
    sample_settlement = {
        "total_expense": 300.00,
        "per_person_share": 100.00,
        "transactions": [
            {
                "from_name": "Bob",
                "from_email": "bob@example.com",
                "to_name": "Alice",
                "to_email": "alice@example.com",
                "amount": 50.00,
            },
            {
                "from_name": "Charlie",
                "from_email": "charlie@example.com",
                "to_name": "Alice",
                "to_email": "alice@example.com",
                "amount": 50.00,
            },
        ],
        "summary": {
            "alice@example.com": {
                "name": "Alice",
                "amount_paid": 200.00,
                "should_pay": 0,
                "should_receive": 100.00,
            },
            "bob@example.com": {
                "name": "Bob",
                "amount_paid": 50.00,
                "should_pay": 50.00,
                "should_receive": 0,
            },
            "charlie@example.com": {
                "name": "Charlie",
                "amount_paid": 50.00,
                "should_pay": 50.00,
                "should_receive": 0,
            },
        },
    }
    
    print("Sending email notifications...")
    results = send_notifications(sample_settlement)
    
    print(f"\nSummary: {sum(1 for r in results if r['sent'])}/{len(results)} emails sent successfully")
