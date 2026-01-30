import { cn } from "@/lib/utils";

interface VoiceIndicatorProps {
  status: "idle" | "connecting" | "connected" | "speaking" | "listening";
  inputLevel?: number;
  outputLevel?: number;
}

export function VoiceIndicator({ status, inputLevel = 0, outputLevel = 0 }: VoiceIndicatorProps) {
  const getStatusText = () => {
    switch (status) {
      case "connecting":
        return "Connecting...";
      case "listening":
        return "Listening...";
      case "speaking":
        return "Speaking...";
      case "connected":
        return "Ready";
      default:
        return "Tap to start";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connecting":
        return "bg-yellow-500/20 text-yellow-600";
      case "listening":
        return "bg-primary/20 text-primary";
      case "speaking":
        return "bg-green-500/20 text-green-600";
      case "connected":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Generate bars for audio visualization
  const generateBars = (level: number, count: number = 5) => {
    return Array.from({ length: count }).map((_, i) => {
      const height = Math.max(4, Math.min(32, level * 40 * (0.5 + Math.random() * 0.5)));
      return (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-75",
            status === "listening" ? "bg-primary" : "bg-green-500"
          )}
          style={{ height: `${height}px` }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main indicator circle */}
      <div
        className={cn(
          "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
          getStatusColor(),
          status === "listening" && "animate-pulse",
          status === "speaking" && "ring-4 ring-green-500/30"
        )}
      >
        {/* Ripple effects for active states */}
        {(status === "listening" || status === "speaking") && (
          <>
            <div
              className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-20",
                status === "listening" ? "bg-primary" : "bg-green-500"
              )}
            />
            <div
              className={cn(
                "absolute inset-0 rounded-full animate-pulse opacity-30",
                status === "listening" ? "bg-primary" : "bg-green-500"
              )}
            />
          </>
        )}

        {/* Icon */}
        <div className="relative z-10">
          {status === "connecting" ? (
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : status === "listening" ? (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : status === "speaking" ? (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </div>
      </div>

      {/* Audio level bars */}
      {(status === "listening" || status === "speaking") && (
        <div className="flex items-center justify-center gap-1 h-10">
          {generateBars(status === "listening" ? inputLevel : outputLevel)}
        </div>
      )}

      {/* Status text */}
      <p className={cn(
        "text-sm font-medium",
        status === "idle" ? "text-muted-foreground" : "text-foreground"
      )}>
        {getStatusText()}
      </p>
    </div>
  );
}
