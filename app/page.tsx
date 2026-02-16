"use client"

import { useState, useEffect } from "react"
import { EventLobby } from "@/components/event-lobby"
import { EventRoom } from "@/components/event-room"

export default function Home() {
  const [eventId, setEventId] = useState<string | null>(null)
  const [eventName, setEventName] = useState<string>("")

  // Restore session from sessionStorage
  useEffect(() => {
    const savedId = sessionStorage.getItem("currentEventId")
    const savedName = sessionStorage.getItem("currentEventName")
    if (savedId && savedName) {
      setEventId(savedId)
      setEventName(savedName)
    }
  }, [])

  const handleEventJoined = (id: string, name: string) => {
    setEventId(id)
    setEventName(name)
    sessionStorage.setItem("currentEventId", id)
    sessionStorage.setItem("currentEventName", name)
  }

  const handleLeave = () => {
    setEventId(null)
    setEventName("")
    sessionStorage.removeItem("currentEventId")
    sessionStorage.removeItem("currentEventName")
  }

  if (!eventId) {
    return <EventLobby onEventJoined={handleEventJoined} />
  }

  return (
    <EventRoom
      eventId={eventId}
      eventName={eventName}
      onLeave={handleLeave}
    />
  )
}
