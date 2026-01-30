import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const prompts = [
  { text: "I'm feeling anxious today", emoji: "😰" },
  { text: "Help me sleep better", emoji: "🌙" },
  { text: "I need to calm down", emoji: "🧘" },
  { text: "I'm feeling overwhelmed", emoji: "😫" },
  { text: "Talk me through a stressful situation", emoji: "🤯" },
  { text: "I want to feel more grateful", emoji: "🙏" },
];

export function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm">Try asking about...</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            onClick={() => onSelect(prompt.text)}
            disabled={disabled}
            className="rounded-full text-sm"
          >
            <span className="mr-1">{prompt.emoji}</span>
            {prompt.text}
          </Button>
        ))}
      </div>
    </div>
  );
}
