"use client"

import React from "react"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  Send,
  X,
  LogOut,
  Loader2,
} from "lucide-react"
import { IdentityModal } from "./identity-modal"
import { MessageList } from "./message-list"
import type { ChatMessage } from "./message-list"

interface ChatPanelProps {
  eventId: string
  participantNames: string[]
}

const IDENTITY_KEY = "expense-chat-identity"

function getStoredIdentity(eventId: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(IDENTITY_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    if (parsed.eventId === eventId) return parsed.name
    return null
  } catch {
    return null
  }
}

function storeIdentity(eventId: string, name: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(IDENTITY_KEY, JSON.stringify({ eventId, name }))
}

function clearStoredIdentity() {
  if (typeof window === "undefined") return
  localStorage.removeItem(IDENTITY_KEY)
}

export function ChatPanel({ eventId, participantNames }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Restore identity from localStorage on mount
  useEffect(() => {
    const stored = getStoredIdentity(eventId)
    if (stored && participantNames.includes(stored)) {
      setCurrentUser(stored)
    }
  }, [eventId, participantNames])

  const fetchMessages = useCallback(async () => {
    if (!eventId) return
    try {
      const res = await fetch(`/api/messages?event_id=${encodeURIComponent(eventId)}`)
      if (!res.ok) return
      const data = await res.json()
      const msgs: ChatMessage[] = data.messages || []
      setMessages(msgs)
      if (!isOpen) {
        setUnreadCount(msgs.length)
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err)
    }
  }, [eventId, isOpen])

  // Polling
  useEffect(() => {
    if (!currentUser || !eventId) return
    setIsLoading(true)
    fetchMessages().finally(() => setIsLoading(false))
    const interval = setInterval(fetchMessages, 4000)
    return () => clearInterval(interval)
  }, [currentUser, eventId, fetchMessages])

  // Clear unread when opening
  useEffect(() => {
    if (isOpen) setUnreadCount(0)
  }, [isOpen])

  const handleSelectIdentity = (name: string) => {
    setCurrentUser(name)
    storeIdentity(eventId, name)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    clearStoredIdentity()
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return
    setIsSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          sender_name: currentUser,
          text: newMessage.trim(),
          participants: participantNames,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || "Failed to send")
      }
      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setNewMessage("")
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Don't render if no participants
  if (participantNames.length === 0) return null

  return (
    <>
      {/* Floating FAB button - visible when panel is closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/40 active:scale-95 animate-in zoom-in fade-in duration-500"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm animate-in zoom-in duration-200">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close chat"
        />
      )}

      {/* Chat Panel */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden bg-background shadow-2xl transition-all duration-500 ease-out ${
          isOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        } bottom-0 left-0 top-0 w-full border-r border-border/60 sm:w-96 lg:w-[380px]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-l from-primary/5 to-accent/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {"\u05E6\u05F3\u05D0\u05D8 \u05D0\u05D9\u05E8\u05D5\u05E2"}
              </h3>
              {currentUser && (
                <p className="text-[11px] text-muted-foreground">
                  {"\u05DE\u05D7\u05D5\u05D1\u05E8 \u05D1\u05EA\u05D5\u05E8 "}{currentUser}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {currentUser && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 bg-transparent text-muted-foreground hover:text-destructive"
                title={"\u05D4\u05EA\u05E0\u05EA\u05E7\u05D5\u05EA"}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 bg-transparent text-muted-foreground hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!currentUser ? (
          <IdentityModal
            participantNames={participantNames}
            onSelectIdentity={handleSelectIdentity}
          />
        ) : (
          <>
            {/* Message List */}
            <div className="flex flex-1 flex-col overflow-hidden bg-muted/20">
              <MessageList
                messages={messages}
                currentUser={currentUser}
                isLoading={isLoading}
              />
            </div>

            {/* Input area */}
            <div className="border-t border-border/60 bg-background p-3">
              <div className="flex gap-2">
                <Input
                  placeholder={"\u05DB\u05EA\u05D1\u05D5 \u05D4\u05D5\u05D3\u05E2\u05D4..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  className="flex-1 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  maxLength={1000}
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  size="icon"
                  className="shrink-0 bg-gradient-to-l from-primary to-accent text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
