"use client";

interface MessageItemProps {
  senderName: string;
  text: string;
  createdAt: string;
  isOwnMessage: boolean;
}

const AVATAR_COLORS = [
  "from-primary to-accent",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-violet-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageItem({
  senderName,
  text,
  createdAt,
  isOwnMessage,
}: MessageItemProps) {
  const avatarColor = getAvatarColor(senderName);
  const initial = senderName.charAt(0).toUpperCase();

  return (
    <div
      className={`flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-sm ${avatarColor}`}
      >
        {initial}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] space-y-1 rounded-2xl px-4 py-2.5 shadow-sm ${
          isOwnMessage
            ? "rounded-tl-2xl rounded-tr-sm bg-gradient-to-l from-primary to-accent text-primary-foreground"
            : "rounded-tl-sm rounded-tr-2xl bg-secondary/60 text-card-foreground"
        }`}
      >
        {!isOwnMessage && (
          <p className="text-xs font-semibold opacity-80">{senderName}</p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </p>
        <p
          className={`text-[10px] ${
            isOwnMessage
              ? "text-primary-foreground/60"
              : "text-muted-foreground"
          }`}
        >
          {formatTime(createdAt)}
        </p>
      </div>
    </div>
  );
}
