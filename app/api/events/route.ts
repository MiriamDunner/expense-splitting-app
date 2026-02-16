import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export interface EventData {
  id: string
  name: string
  passwordHash: string
  createdAt: string
  participants: Array<{
    name: string
    email: string
    amount_paid: number
  }>
  expenses: Array<{
    id: string
    description: string
    amount: number
    paidBy: string
    createdAt: string
  }>
}

// In-memory event store
const eventStore: Map<string, EventData> = new Map()

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// GET - fetch event data by id (requires password in header)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get("id")
  const action = searchParams.get("action")

  // List all event names (for join validation)
  if (action === "check") {
    const eventName = searchParams.get("name")
    if (!eventName) {
      return NextResponse.json({ error: "\u05E9\u05DD \u05D0\u05D9\u05E8\u05D5\u05E2 \u05E0\u05D3\u05E8\u05E9" }, { status: 400 })
    }
    const found = Array.from(eventStore.values()).find(
      (e) => e.name === eventName.trim(),
    )
    return NextResponse.json({ exists: !!found })
  }

  if (!eventId) {
    return NextResponse.json({ error: "\u05DE\u05D6\u05D4\u05D4 \u05D0\u05D9\u05E8\u05D5\u05E2 \u05E0\u05D3\u05E8\u05E9" }, { status: 400 })
  }

  const event = eventStore.get(eventId)
  if (!event) {
    return NextResponse.json({ error: "\u05D0\u05D9\u05E8\u05D5\u05E2 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, { status: 404 })
  }

  return NextResponse.json({
    id: event.id,
    name: event.name,
    createdAt: event.createdAt,
    participants: event.participants,
    expenses: event.expenses,
  })
}

// POST - create or join event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, name, password } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "\u05E9\u05DD \u05D0\u05D9\u05E8\u05D5\u05E2 \u05E0\u05D3\u05E8\u05E9" }, { status: 400 })
    }

    if (!password?.trim() || password.trim().length < 3) {
      return NextResponse.json(
        { error: "\u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05DB\u05D9\u05DC \u05DC\u05E4\u05D7\u05D5\u05EA 3 \u05EA\u05D5\u05D5\u05D9\u05DD" },
        { status: 400 },
      )
    }

    if (action === "create") {
      // Check if event name already exists
      const existing = Array.from(eventStore.values()).find(
        (e) => e.name === name.trim(),
      )
      if (existing) {
        return NextResponse.json(
          { error: "\u05E9\u05DD \u05D0\u05D9\u05E8\u05D5\u05E2 \u05D6\u05D4 \u05DB\u05D1\u05E8 \u05EA\u05E4\u05D5\u05E1. \u05D1\u05D7\u05E8\u05D5 \u05E9\u05DD \u05D0\u05D7\u05E8." },
          { status: 409 },
        )
      }

      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      const event: EventData = {
        id: eventId,
        name: name.trim(),
        passwordHash: hashPassword(password.trim()),
        createdAt: new Date().toISOString(),
        participants: [],
        expenses: [],
      }

      eventStore.set(eventId, event)

      return NextResponse.json(
        {
          id: event.id,
          name: event.name,
          createdAt: event.createdAt,
        },
        { status: 201 },
      )
    }

    if (action === "join") {
      const event = Array.from(eventStore.values()).find(
        (e) => e.name === name.trim(),
      )

      if (!event) {
        return NextResponse.json(
          { error: "\u05D0\u05D9\u05E8\u05D5\u05E2 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0. \u05D1\u05D3\u05E7\u05D5 \u05D0\u05EA \u05D4\u05E9\u05DD." },
          { status: 404 },
        )
      }

      if (event.passwordHash !== hashPassword(password.trim())) {
        return NextResponse.json(
          { error: "\u05E1\u05D9\u05E1\u05DE\u05D4 \u05E9\u05D2\u05D5\u05D9\u05D4" },
          { status: 401 },
        )
      }

      return NextResponse.json({
        id: event.id,
        name: event.name,
        createdAt: event.createdAt,
        participants: event.participants,
        expenses: event.expenses,
      })
    }

    return NextResponse.json(
      { error: "\u05E4\u05E2\u05D5\u05DC\u05D4 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9\u05EA. \u05D4\u05E9\u05EA\u05DE\u05E9\u05D5 \u05D1-create \u05D0\u05D5 join." },
      { status: 400 },
    )
  } catch {
    return NextResponse.json({ error: "\u05D1\u05E7\u05E9\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05E0\u05D4" }, { status: 400 })
  }
}

// PUT - update event data (participants/expenses)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, participants, expenses } = body

    if (!id) {
      return NextResponse.json({ error: "\u05DE\u05D6\u05D4\u05D4 \u05D0\u05D9\u05E8\u05D5\u05E2 \u05E0\u05D3\u05E8\u05E9" }, { status: 400 })
    }

    const event = eventStore.get(id)
    if (!event) {
      return NextResponse.json({ error: "\u05D0\u05D9\u05E8\u05D5\u05E2 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, { status: 404 })
    }

    if (participants !== undefined) {
      event.participants = participants
    }
    if (expenses !== undefined) {
      event.expenses = expenses
    }

    eventStore.set(id, event)

    return NextResponse.json({
      id: event.id,
      name: event.name,
      participants: event.participants,
      expenses: event.expenses,
    })
  } catch {
    return NextResponse.json({ error: "\u05D1\u05E7\u05E9\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05E0\u05D4" }, { status: 400 })
  }
}
