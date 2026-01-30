import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceModeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceModeButton({ onClick, disabled, className }: VoiceModeButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-[52px] w-[52px] flex-shrink-0 rounded-full border-primary/50 hover:bg-primary/10 hover:border-primary transition-all",
        className
      )}
      title="Start voice conversation"
    >
      <Mic className="h-5 w-5 text-primary" />
    </Button>
  );
}
