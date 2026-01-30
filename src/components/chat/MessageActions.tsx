import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
  content: string;
  messageIndex: number;
}

export function MessageActions({ content, messageIndex }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReaction = (type: "up" | "down") => {
    setReaction(type);
    toast.success(type === "up" ? "Thanks for the feedback! 💚" : "Sorry to hear that. We'll do better!");
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3 w-3 text-primary" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", reaction === "up" && "text-primary")}
        onClick={() => handleReaction("up")}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", reaction === "down" && "text-destructive")}
        onClick={() => handleReaction("down")}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
}
