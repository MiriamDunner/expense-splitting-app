"use client"

interface MessageItemProps {
  senderName: string
  text: string
  createdAt: string
  isOwnMessage: boolean
}

const AVATAR_COLORS = [
  "from-teal-500 to-cyan-500",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-green-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-500",
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  })
  if (isToday) return time
  return `${date.toLocaleDateString("he-IL", { day: "numeric", month: "short" })} ${time}`
}

export function MessageItem({
  senderName,
  text,
  createdAt,
  isOwnMessage,
}: MessageItemProps) {
  const avatarColor = getAvatarColor(senderName)
  const initial = senderName.charAt(0).toUpperCase()

  return (
    <div
      className={`flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200 ${
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white shadow-sm ${avatarColor}`}
      >
        {initial}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] ${isOwnMessage ? "items-end" : "items-start"}`}>
        {!isOwnMessage && (
          <p className={`mb-0.5 text-[11px] font-medium text-muted-foreground ${isOwnMessage ? "text-left" : "text-right"}`}>
            {senderName}
          </p>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2 shadow-sm ${
            isOwnMessage
              ? "rounded-tl-2xl rounded-tr-md bg-gradient-to-l from-primary to-accent text-primary-foreground"
              : "rounded-tl-md rounded-tr-2xl bg-card text-card-foreground ring-1 ring-border/60"
          }`}
        >
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
            {text}
          </p>
        </div>
        <p
          className={`mt-0.5 text-[10px] text-muted-foreground/60 ${
            isOwnMessage ? "text-left" : "text-right"
          }`}
        >
          {formatTime(createdAt)}
        </p>
      </div>
    </div>
  )
}
