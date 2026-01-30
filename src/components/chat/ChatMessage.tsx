import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-2xl max-w-[85%]",
        isAssistant
          ? "bg-muted/50 self-start"
          : "bg-primary text-primary-foreground self-end ml-auto"
      )}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className={cn("flex-1 min-w-0", isAssistant ? "prose prose-sm max-w-none dark:prose-invert" : "")}>
        {isAssistant ? (
          <>
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1" />
            )}
          </>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
