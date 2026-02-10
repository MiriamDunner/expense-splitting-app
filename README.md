<div align="center">

<img src="public/readme-banner.jpg" alt="Expense Splitter Banner" width="100%" />

# Expense Splitter

### Split expenses fairly. Settle smartly. Notify instantly.

[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/nsgbzTtiI6V)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/miriamdunners-projects/v0-expense-splitting-app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

**A modern, full-stack expense splitting application** that calculates the minimum number of transactions needed to settle group expenses - powered by a smart greedy algorithm.

Built with **AI-assisted smart coding (vibe coding)** using [v0.app](https://v0.app), then customized and refined to match my exact requirements.

[Live Demo](https://vercel.com/miriamdunners-projects/v0-expense-splitting-app) | [Report Bug](https://github.com/MiriamDunner/expense-splitting-app/issues) | [Request Feature](https://github.com/MiriamDunner/expense-splitting-app/issues)

</div>

---

## Features

<img src="public/readme-features.jpg" alt="Features Overview" width="100%" />

| Feature | Description |
|---------|-------------|
| **Smart Settlement Algorithm** | Minimizes the number of transactions using a greedy creditor-debtor matching approach |
| **Full Hebrew RTL Support** | Complete right-to-left interface with proper Hebrew localization |
| **New Israeli Shekel (NIS)** | All amounts displayed in NIS currency |
| **Real-time Validation** | Instant input validation with email format checking, required field indicators, and visual feedback |
| **Beautiful Email Notifications** | Professionally designed HTML emails sent via Resend API with personalized settlement details |
| **Responsive Design** | Looks great on desktop, tablet, and mobile devices |
| **Smooth Animations** | Polished micro-interactions, card transitions, and hover effects throughout |
| **Step-by-Step UX** | Guided 3-step flow: name your event, add participants, calculate and send |
| **FastAPI Backend** | Alternative Python backend with Pydantic validation and auto-generated API docs |

---

## How It Works

<img src="public/readme-algorithm.jpg" alt="Algorithm Visualization" width="100%" />

### The Settlement Algorithm

The core algorithm minimizes the number of money transfers needed to settle all debts:

1. **Calculate fair share** - Total expenses divided equally among all participants
2. **Compute balances** - Each person's payment minus their fair share (positive = creditor, negative = debtor)
3. **Sort and match** - Creditors sorted descending, debtors sorted ascending by balance
4. **Greedy settlement** - Match the largest creditor with the largest debtor, transfer the minimum of both balances, repeat

**Example:**
> 4 friends go on a trip. Instead of 12 possible transactions (everyone paying everyone), the algorithm reduces it to just 2-3 optimal transfers.

```
Before (naive):     After (optimized):
A -> B: 50          A -> C: 80
A -> C: 30          B -> C: 40
B -> C: 40
B -> D: 10
D -> C: 20
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19.2 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Icons** | Lucide React |
| **Email Service** | Resend API |
| **Alt. Backend** | Python FastAPI + Pydantic |
| **Deployment** | Vercel |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/MiriamDunner/expense-splitting-app.git

# Navigate to project directory
cd expense-splitting-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Email Configuration (Optional)

To enable real email sending, add your Resend API key:

```bash
# Add to your environment variables
RESEND_API_KEY=re_your_api_key_here
```

> Without the API key, the app runs in preview mode and logs email content to the console.

### FastAPI Backend (Optional)

```bash
# Install Python dependencies
pip install -r scripts/requirements.txt

# Start the API server
python scripts/fastapi_server.py
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Project Structure

```
expense-splitting-app/
├── app/
│   ├── api/
│   │   ├── calculate-settlement/   # Settlement algorithm API
│   │   └── send-notifications/     # Email notification API
│   ├── globals.css                  # Theme & design tokens
│   ├── layout.tsx                   # RTL Hebrew layout
│   └── page.tsx                     # Main app page
├── components/
│   ├── expense-form.tsx             # Participant input form
│   ├── settlement-summary.tsx       # Results & email sending
│   └── ui/                          # shadcn/ui components
├── scripts/
│   ├── fastapi_server.py            # Alternative Python backend
│   └── send_email_notifications.py  # Standalone email script
└── public/
    └── ...                          # Static assets
```

---

## About the Build Process

This project was initiated using **AI-assisted smart coding** with [v0.app](https://v0.app) - a vibe coding approach where the initial structure, components, and algorithms were generated through intelligent prompting. From there, I made significant customizations including:

- Full Hebrew localization with RTL support
- NIS currency integration
- Custom input validation rules
- Enhanced animations and micro-interactions
- Personalized email templates
- UX refinements for clarity

The result is a production-ready application that combines the speed of AI-assisted development with the precision of manual customization.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with smart coding vibes** | **Customized with care**

Made by [Miriam Dunner](https://github.com/MiriamDunner)

</div>
