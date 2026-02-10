"use client";

import React from "react"

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Users,
  Loader2,
} from "lucide-react";
import { MessageList } from "./message-list";
import type { ChatMessage } from "./message-list";

interface ChatBoxProps {
  eventId: string;
  participantNames: string[];
}

export function ChatBox({ eventId, participantNames }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/messages?event_id=${encodeURIComponent(eventId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [eventId]);

  // Initial load and polling
  useEffect(() => {
    if (!isOpen || !eventId) return;
    setIsLoading(true);
    fetchMessages().finally(() => setIsLoading(false));

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [isOpen, eventId, fetchMessages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !senderName) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          sender_name: senderName,
          text: newMessage.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to send");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const unreadCount = messages.length;

  return (
    <Card
      className={`overflow-hidden border-border/60 shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${
        isOpen ? "ring-2 ring-primary/20" : ""
      }`}
    >
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-gradient-to-l from-primary/5 to-accent/5 px-6 py-4 text-right transition-colors duration-200 hover:from-primary/10 hover:to-accent/10"
      >
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {"\u05E6\u05F3\u05D0\u05D8 \u05D0\u05D9\u05E8\u05D5\u05E2"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {"\u05D3\u05D1\u05E8\u05D5 \u05E2\u05DD \u05D4\u05DE\u05E9\u05EA\u05EA\u05E4\u05D9\u05DD \u05E2\u05DC \u05D4\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05D5\u05D4\u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isOpen && unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground animate-in zoom-in duration-200">
              {unreadCount}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Chat Content */}
      {isOpen && (
        <CardContent className="space-y-4 p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Sender selector */}
          {participantNames.length > 0 ? (
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {"\u05DE\u05D9 \u05D0\u05EA\u05D4?"}
              </label>
              <div className="flex flex-wrap gap-2">
                {participantNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSenderName(name)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      senderName === name
                        ? "bg-gradient-to-l from-primary to-accent text-primary-foreground shadow-md shadow-primary/20 scale-105"
                        : "bg-secondary/60 text-secondary-foreground hover:bg-secondary hover:scale-105"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-muted/40 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {"\u05D4\u05D5\u05E1\u05D9\u05E4\u05D5 \u05DE\u05E9\u05EA\u05EA\u05E4\u05D9\u05DD \u05DC\u05D8\u05D5\u05E4\u05E1 \u05DB\u05D3\u05D9 \u05DC\u05D4\u05E9\u05EA\u05DE\u05E9 \u05D1\u05E6\u05F3\u05D0\u05D8"}
              </p>
            </div>
          )}

          {/* Messages */}
          {senderName && (
            <>
              <MessageList
                messages={messages}
                currentUser={senderName}
                isLoading={isLoading}
              />

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder={"\u05DB\u05EA\u05D1\u05D5 \u05D4\u05D5\u05D3\u05E2\u05D4..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  maxLength={1000}
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  size="icon"
                  className="shrink-0 bg-gradient-to-l from-primary to-accent text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
