# Email Notifications Setup Guide

## שליחת מיילים אוטומטיים למשתתפים

מערכת זו תומכת בשליחת מיילים אוטומטיים לכל משתתף עם פירוט מי חייב לשלם למי.

## שתי דרכים לשלוח מיילים:

### Option 1: FastAPI Backend + SMTP (מומלץ)
השרת מעבד את המיילים דרך SMTP Server (כמו Gmail).

#### הגדרה עבור Gmail:
1. הפוך 2-Factor Authentication בחשבון Gmail שלך
2. צור "App-specific password" ב-Account Settings
3. הגדר environment variables:

```bash
export SMTP_FROM_EMAIL="your-email@gmail.com"
export SMTP_PASSWORD="your-app-specific-password"
export SMTP_SERVER="smtp.gmail.com"
export SMTP_PORT="587"
```

#### הגדרה עבור Outlook:
```bash
export SMTP_FROM_EMAIL="your-email@outlook.com"
export SMTP_PASSWORD="your-password"
export SMTP_SERVER="smtp-mail.outlook.com"
export SMTP_PORT="587"
```

#### הגדרה עבור Gmail App Password:
```bash
export SMTP_FROM_EMAIL="your-email@gmail.com"
export SMTP_PASSWORD="your-16-character-app-password"
export SMTP_SERVER="smtp.gmail.com"
export SMTP_PORT="587"
```

### Option 2: Resend API (Alternative)
שימוש בResend service לשליחת מיילים.

```bash
export RESEND_API_KEY="your_resend_api_key"
```

## איך זה עובד:

1. **משתמש מלא את הטופס** עם השתתפים וסכומים שהם שילמו
2. **לוחץ על "חשב חלוקה"** כדי לחשב את ההעברות המינימליות
3. **לוחץ על "שלחו התראות במייל"**
4. **ההודעות נשלחות**:
   - כל משתתף מקבל מייל עם:
     - סך הוצאות
     - החלק ההוגן שלו
     - סכום ששילם
     - למי הוא חייב או ממי הוא צריך לקבל

## מדי Mode (Preview Mode):

כאן אין SMTP configured, המיילים יודפסו בקונסול בפורמט טקסט.

## בעיות שכיחות:

### "תקבל שגיאה בשליחת מיילים"
- בדוק ש-SMTP environment variables מוגדרים
- בדוק שה-FastAPI server רץ על localhost:8000
- בדוק את פורט ה-SMTP (587 עבור TLS, 465 עבור SSL)

### מיילים לא מגיעים
- בדוק קובץ Spam
- בדוק שמצב "Less secure app access" מופעל (Gmail)
- בדוק שניסיון לשלוח מהכתובת הנכונה

## Testing:

בדוק את ה-endpoint ידנית:

```bash
curl -X POST http://localhost:8000/send-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "settlement": {
      "event_name": "קניון",
      "total_expense": 300,
      "per_person_share": 100,
      "transactions": [...],
      "summary": {...}
    }
  }'
```
