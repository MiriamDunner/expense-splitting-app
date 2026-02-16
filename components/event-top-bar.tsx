"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  LogOut,
  Users,
  Receipt,
} from "lucide-react"

interface EventTopBarProps {
  eventName: string
  participantCount: number
  onLeave: () => void
}

export function EventTopBar({ eventName, participantCount, onLeave }: EventTopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Right side - event info */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-2 shadow-sm">
            <Receipt className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground sm:text-base">{eventName}</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {participantCount > 0
                  ? `${participantCount} \u05DE\u05E9\u05EA\u05EA\u05E4\u05D9\u05DD`
                  : "\u05D0\u05D9\u05DF \u05DE\u05E9\u05EA\u05EA\u05E4\u05D9\u05DD \u05E2\u05D3\u05D9\u05D9\u05DF"}
              </span>
            </div>
          </div>
        </div>

        {/* Left side - actions */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden gap-1 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {"\u05DE\u05D7\u05D5\u05D1\u05E8"}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeave}
            className="gap-1.5 text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{"\u05E2\u05D6\u05D9\u05D1\u05EA \u05D0\u05D9\u05E8\u05D5\u05E2"}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
