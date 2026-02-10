import { NextRequest, NextResponse } from "next/server"

export interface Message {
  id: string
  event_id: string
  sender_name: string
  text: string
  created_at: string
}

// In-memory store keyed by event_id
const messageStore: Map<string, Message[]> = new Map()

// Store participant lists per event for validation
const eventParticipants: Map<string, string[]> = new Map()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get("event_id")

  if (!eventId) {
    return NextResponse.json(
      { error: "event_id is required" },
      { status: 400 },
    )
  }

  const messages = messageStore.get(eventId) || []
  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, sender_name, text, participants } = body

    if (!event_id || !sender_name?.trim() || !text?.trim()) {
      return NextResponse.json(
        { error: "event_id, sender_name, and text are required" },
        { status: 400 },
      )
    }

    if (text.trim().length > 1000) {
      return NextResponse.json(
        { error: "Message too long (max 1000 characters)" },
        { status: 400 },
      )
    }

    // Update stored participants if provided
    if (participants && Array.isArray(participants)) {
      eventParticipants.set(event_id, participants)
    }

    // Validate sender is a known participant
    const knownParticipants = eventParticipants.get(event_id)
    if (knownParticipants && knownParticipants.length > 0) {
      if (!knownParticipants.includes(sender_name.trim())) {
        return NextResponse.json(
          {
            error: `Unknown sender. Allowed participants: ${knownParticipants.join(", ")}`,
          },
          { status: 403 },
        )
      }
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      event_id,
      sender_name: sender_name.trim(),
      text: text.trim(),
      created_at: new Date().toISOString(),
    }

    if (!messageStore.has(event_id)) {
      messageStore.set(event_id, [])
    }
    messageStore.get(event_id)!.push(message)

    return NextResponse.json({ message }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    )
  }
}
