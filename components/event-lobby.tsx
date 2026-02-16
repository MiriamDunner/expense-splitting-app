"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Plus,
  LogIn,
  Lock,
  Calendar,
  Loader2,
  AlertCircle,
  Sparkles,
  Users,
  ArrowLeft,
} from "lucide-react"

interface EventLobbyProps {
  onEventJoined: (eventId: string, eventName: string) => void
}

export function EventLobby({ onEventJoined }: EventLobbyProps) {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose")
  const [eventName, setEventName] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    setError("")
    if (!eventName.trim()) {
      setError("\u05E0\u05D0 \u05DC\u05D4\u05D6\u05D9\u05DF \u05E9\u05DD \u05D0\u05D9\u05E8\u05D5\u05E2")
      return
    }
    if (!password.trim() || password.trim().length < 3) {
      setError("\u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05DB\u05D9\u05DC \u05DC\u05E4\u05D7\u05D5\u05EA 3 \u05EA\u05D5\u05D5\u05D9\u05DD")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: eventName.trim(), password: password.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D9\u05E6\u05D9\u05E8\u05EA \u05D4\u05D0\u05D9\u05E8\u05D5\u05E2")
        return
      }
      onEventJoined(data.id, data.name)
    } catch {
      setError("\u05E9\u05D2\u05D9\u05D0\u05EA \u05E8\u05E9\u05EA. \u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async () => {
    setError("")
    if (!eventName.trim()) {
      setError("\u05E0\u05D0 \u05DC\u05D4\u05D6\u05D9\u05DF \u05E9\u05DD \u05D0\u05D9\u05E8\u05D5\u05E2")
      return
    }
    if (!password.trim()) {
      setError("\u05E0\u05D0 \u05DC\u05D4\u05D6\u05D9\u05DF \u05E1\u05D9\u05E1\u05DE\u05D4")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", name: eventName.trim(), password: password.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D4\u05EA\u05D7\u05D1\u05E8\u05D5\u05EA \u05DC\u05D0\u05D9\u05E8\u05D5\u05E2")
        return
      }
      onEventJoined(data.id, data.name)
    } catch {
      setError("\u05E9\u05D2\u05D9\u05D0\u05EA \u05E8\u05E9\u05EA. \u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetToChoice = () => {
    setMode("choose")
    setEventName("")
    setPassword("")
    setError("")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      {/* Decorative floating shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-in zoom-in duration-1000" />
        <div
          className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl animate-in zoom-in duration-1000"
          style={{ animationDelay: "300ms" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-primary/3 blur-3xl animate-in zoom-in duration-1000"
          style={{ animationDelay: "600ms" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo header */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="mb-4 inline-flex items-center gap-3">
            <div className="relative rounded-2xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg shadow-primary/25">
              <Users className="h-8 w-8 text-primary-foreground" />
              <Sparkles className="absolute -top-1.5 -left-1.5 h-5 w-5 animate-pulse text-accent" />
            </div>
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {"\u05DE\u05D7\u05DC\u05E7 \u05D4\u05D5\u05E6\u05D0\u05D5\u05EA"}
          </h1>
          <p className="mt-2 text-balance text-muted-foreground">
            {"\u05E6\u05E8\u05D5 \u05D0\u05D9\u05E8\u05D5\u05E2 \u05D7\u05D3\u05E9 \u05D0\u05D5 \u05D4\u05E6\u05D8\u05E8\u05E4\u05D5 \u05DC\u05D0\u05D9\u05E8\u05D5\u05E2 \u05E7\u05D9\u05D9\u05DD"}
          </p>
        </div>

        {/* Choose mode */}
        {mode === "choose" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card
              className="group cursor-pointer border-2 border-transparent bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              onClick={() => setMode("create")}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Plus className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-right">
                  <CardTitle className="text-lg text-card-foreground">
                    {"\u05D9\u05E6\u05D9\u05E8\u05EA \u05D0\u05D9\u05E8\u05D5\u05E2 \u05D7\u05D3\u05E9"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {"\u05E4\u05EA\u05D7\u05D5 \u05D7\u05D3\u05E8 \u05DE\u05E9\u05D5\u05EA\u05E3 \u05D5\u05D4\u05D6\u05DE\u05D9\u05E0\u05D5 \u05D7\u05D1\u05E8\u05D9\u05DD"}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer border-2 border-transparent bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10"
              onClick={() => setMode("join")}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-xl bg-gradient-to-br from-accent to-primary p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <LogIn className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="text-right">
                  <CardTitle className="text-lg text-card-foreground">
                    {"\u05D4\u05E6\u05D8\u05E8\u05E4\u05D5\u05EA \u05DC\u05D0\u05D9\u05E8\u05D5\u05E2 \u05E7\u05D9\u05D9\u05DD"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {"\u05D4\u05D9\u05DB\u05E0\u05E1\u05D5 \u05E2\u05DD \u05E9\u05DD \u05D0\u05D9\u05E8\u05D5\u05E2 \u05D5\u05E1\u05D9\u05E1\u05DE\u05D4"}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create event form */}
        {mode === "create" && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 border-0 bg-card/80 shadow-xl backdrop-blur-sm duration-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetToChoice}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {"\u05D7\u05D6\u05E8\u05D4"}
                </Button>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-2.5">
                  <Plus className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl text-card-foreground">{"\u05D0\u05D9\u05E8\u05D5\u05E2 \u05D7\u05D3\u05E9"}</CardTitle>
                  <CardDescription>{"\u05E6\u05E8\u05D5 \u05D7\u05D3\u05E8 \u05DE\u05E9\u05D5\u05EA\u05E3 \u05DC\u05D7\u05DC\u05D5\u05E7\u05EA \u05D4\u05D5\u05E6\u05D0\u05D5\u05EA"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  {"\u05E9\u05DD \u05D0\u05D9\u05E8\u05D5\u05E2"}
                </label>
                <Input
                  placeholder={"\u05DC\u05DE\u05E9\u05DC: \u05D8\u05D9\u05D5\u05DC \u05DC\u05D0\u05D9\u05DC\u05EA, \u05D0\u05E8\u05D5\u05D7\u05EA \u05E2\u05E8\u05D1..."}
                  value={eventName}
                  onChange={(e) => {
                    setEventName(e.target.value)
                    setError("")
                  }}
                  className="bg-background/60"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                  <Lock className="h-4 w-4 text-primary" />
                  {"\u05E1\u05D9\u05E1\u05DE\u05D4"}
                </label>
                <Input
                  type="password"
                  placeholder={"\u05DC\u05E4\u05D7\u05D5\u05EA 3 \u05EA\u05D5\u05D5\u05D9\u05DD"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  className="bg-background/60"
                  dir="rtl"
                />
                <p className="text-xs text-muted-foreground">
                  {"\u05E9\u05EA\u05E4\u05D5 \u05D0\u05EA \u05D4\u05E1\u05D9\u05E1\u05DE\u05D4 \u05E2\u05DD \u05D4\u05D7\u05D1\u05E8\u05D9\u05DD \u05DB\u05D3\u05D9 \u05E9\u05D9\u05D5\u05DB\u05DC\u05D5 \u05DC\u05D4\u05E6\u05D8\u05E8\u05E3"}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                onClick={handleCreate}
                disabled={isLoading}
                className="w-full bg-gradient-to-l from-primary to-accent text-primary-foreground shadow-md hover:shadow-lg"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {"\u05D9\u05D5\u05E6\u05E8..."}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {"\u05E6\u05D5\u05E8 \u05D0\u05D9\u05E8\u05D5\u05E2"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Join event form */}
        {mode === "join" && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 border-0 bg-card/80 shadow-xl backdrop-blur-sm duration-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetToChoice}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {"\u05D7\u05D6\u05E8\u05D4"}
                </Button>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="rounded-xl bg-gradient-to-br from-accent to-primary p-2.5">
                  <LogIn className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl text-card-foreground">{"\u05D4\u05E6\u05D8\u05E8\u05E4\u05D5\u05EA \u05DC\u05D0\u05D9\u05E8\u05D5\u05E2"}</CardTitle>
                  <CardDescription>{"\u05D4\u05D9\u05DB\u05E0\u05E1\u05D5 \u05DC\u05D0\u05D9\u05E8\u05D5\u05E2 \u05E7\u05D9\u05D9\u05DD \u05E2\u05DD \u05D4\u05E1\u05D9\u05E1\u05DE\u05D4 \u05E9\u05E7\u05D9\u05D1\u05DC\u05EA\u05DD"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                  <Calendar className="h-4 w-4 text-accent" />
                  {"\u05E9\u05DD \u05D0\u05D9\u05E8\u05D5\u05E2"}
                </label>
                <Input
                  placeholder={"\u05D4\u05D6\u05D9\u05E0\u05D5 \u05D0\u05EA \u05E9\u05DD \u05D4\u05D0\u05D9\u05E8\u05D5\u05E2 \u05D1\u05D3\u05D9\u05D5\u05E7"}
                  value={eventName}
                  onChange={(e) => {
                    setEventName(e.target.value)
                    setError("")
                  }}
                  className="bg-background/60"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                  <Lock className="h-4 w-4 text-accent" />
                  {"\u05E1\u05D9\u05E1\u05DE\u05D4"}
                </label>
                <Input
                  type="password"
                  placeholder={"\u05D4\u05E1\u05D9\u05E1\u05DE\u05D4 \u05E9\u05E7\u05D9\u05D1\u05DC\u05EA\u05DD \u05DE\u05D9\u05D5\u05E6\u05E8 \u05D4\u05D0\u05D9\u05E8\u05D5\u05E2"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  className="bg-background/60"
                  dir="rtl"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                onClick={handleJoin}
                disabled={isLoading}
                className="w-full bg-gradient-to-l from-accent to-primary text-primary-foreground shadow-md hover:shadow-lg"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {"\u05DE\u05EA\u05D7\u05D1\u05E8..."}
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    {"\u05D4\u05D9\u05DB\u05E0\u05E1 \u05DC\u05D0\u05D9\u05E8\u05D5\u05E2"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
