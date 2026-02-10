"use client"

import { useEffect, useRef } from "react"
import { MessageItem } from "./message-item"
import { Loader2, MessageCircle } from "lucide-react"

export interface ChatMessage {
  id: string
  event_id: string
  sender_name: string
  text: string
  created_at: string
}

interface MessageListProps {
  messages: ChatMessage[]
  currentUser: string
  isLoading: boolean
}

export function MessageList({
  messages,
  currentUser,
  isLoading,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {"\u05D8\u05D5\u05E2\u05DF \u05D4\u05D5\u05D3\u05E2\u05D5\u05EA..."}
        </p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-2xl bg-primary/10 p-3">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground">
            {"\u05D0\u05D9\u05DF \u05D4\u05D5\u05D3\u05E2\u05D5\u05EA \u05E2\u05D3\u05D9\u05D9\u05DF"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {"\u05D4\u05D9\u05D5 \u05D4\u05E8\u05D0\u05E9\u05D5\u05E0\u05D9\u05DD \u05DC\u05E9\u05DC\u05D5\u05D7 \u05D4\u05D5\u05D3\u05E2\u05D4!"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto scroll-smooth px-1 py-2">
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          senderName={msg.sender_name}
          text={msg.text}
          createdAt={msg.created_at}
          isOwnMessage={msg.sender_name === currentUser}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
