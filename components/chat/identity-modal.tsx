"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, User, Lock, ArrowLeft } from "lucide-react"

interface IdentityModalProps {
  participantNames: string[]
  onSelectIdentity: (name: string) => void
}

const AVATAR_COLORS = [
  "from-teal-500 to-cyan-500",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-green-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-500",
]

function getColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function IdentityModal({
  participantNames,
  onSelectIdentity,
}: IdentityModalProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [passcode, setPasscode] = useState("")
  const [step, setStep] = useState<"select" | "confirm">("select")

  const handleSelect = (name: string) => {
    setSelected(name)
    setStep("confirm")
  }

  const handleConfirm = () => {
    if (selected) {
      onSelectIdentity(selected)
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Icon */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 p-4 shadow-lg shadow-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          {step === "select" ? (
            <>
              <h3 className="text-xl font-bold text-foreground">
                {"\u05DE\u05D9 \u05D0\u05EA\u05D4?"}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {"\u05D1\u05D7\u05E8\u05D5 \u05D0\u05EA \u05D4\u05E9\u05DD \u05E9\u05DC\u05DB\u05DD \u05DB\u05D3\u05D9 \u05DC\u05D4\u05E9\u05EA\u05EA\u05E3 \u05D1\u05E6\u05F3\u05D0\u05D8"}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-foreground">
                {"\u05D0\u05D9\u05DE\u05D5\u05EA \u05D6\u05D4\u05D5\u05EA"}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {"\u05D4\u05D6\u05D9\u05E0\u05D5 \u05E7\u05D5\u05D3 \u05D0\u05D9\u05E9\u05D9 \u05DC\u05D0\u05D9\u05DE\u05D5\u05EA, \u05D0\u05D5 \u05DC\u05D7\u05E6\u05D5 \u05D4\u05DE\u05E9\u05DA \u05DC\u05DB\u05E0\u05D9\u05E1\u05D4"}
              </p>
            </>
          )}
        </div>

        {step === "select" ? (
          <div className="space-y-2">
            {participantNames.map((name, index) => (
              <button
                key={`participant-${index}-${name}`}
                type="button"
                onClick={() => handleSelect(name)}
                className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 text-right transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm ${getColor(name)}`}
                >
                  {name.charAt(0)}
                </div>
                <span className="flex-1 text-sm font-medium text-card-foreground">
                  {name}
                </span>
                <User className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected user display */}
            <div className="flex items-center justify-center gap-3 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/20">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm ${getColor(selected || "")}`}
              >
                {selected?.charAt(0)}
              </div>
              <span className="text-base font-semibold text-foreground">
                {selected}
              </span>
            </div>

            {/* Passcode input */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                {"\u05E7\u05D5\u05D3 \u05D0\u05D9\u05E9\u05D9"}
                <span className="font-normal text-muted-foreground/60">
                  {"(\u05D0\u05D5\u05E4\u05E6\u05D9\u05D5\u05E0\u05DC\u05D9)"}
                </span>
              </label>
              <Input
                type="password"
                dir="ltr"
                placeholder="****"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                className="text-center tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("select")
                  setSelected(null)
                  setPasscode("")
                }}
                className="bg-transparent"
              >
                <ArrowLeft className="ml-1.5 h-4 w-4" />
                {"\u05D7\u05D6\u05E8\u05D4"}
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-l from-primary to-accent text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                {"\u05DB\u05E0\u05D9\u05E1\u05D4 \u05DC\u05E6\u05F3\u05D0\u05D8"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
