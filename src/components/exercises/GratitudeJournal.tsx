import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Heart } from "lucide-react";

interface GratitudeJournalProps {
  onComplete?: () => void;
}

const prompts = [
  "What made you smile today?",
  "Who are you grateful for in your life?",
  "What's something simple that brings you joy?",
  "What challenge are you grateful to have overcome?",
  "What about your body are you thankful for?",
  "What skill or ability are you grateful to have?",
  "What's a memory that always makes you happy?",
  "What's something in nature you appreciate?",
];

export function GratitudeJournal({ onComplete }: GratitudeJournalProps) {
  const [entries, setEntries] = useState<string[]>(["", "", ""]);
  const [prompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const handleEntryChange = (index: number, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = value;
    setEntries(newEntries);
  };

  const saveCompletion = useCallback(async () => {
    const filledEntries = entries.filter((e) => e.trim().length > 0);
    if (filledEntries.length === 0) {
      toast.error("Please add at least one gratitude entry");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const duration = Math.round((Date.now() - startTime) / 1000);
      await supabase.from("exercise_completions").insert({
        user_id: user.id,
        exercise_type: "gratitude",
        duration_seconds: duration,
        notes: JSON.stringify({ prompt, entries: filledEntries }),
      });

      toast.success("Gratitude saved! 💝");
      onComplete?.();
    } catch (error) {
      console.error("Error saving completion:", error);
      toast.error("Failed to save gratitude entry");
    } finally {
      setIsSubmitting(false);
    }
  }, [entries, prompt, startTime, onComplete]);

  const filledCount = entries.filter((e) => e.trim().length > 0).length;

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">💝 Daily Gratitude</CardTitle>
        <p className="text-muted-foreground">Shift your perspective with gratitude</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt */}
        <div className="bg-wellness-warmth/50 rounded-xl p-4 text-center">
          <Sparkles className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-foreground font-medium">{prompt}</p>
        </div>

        {/* Entry inputs */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            List three things you're grateful for today:
          </p>
          {entries.map((entry, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <Textarea
                value={entry}
                onChange={(e) => handleEntryChange(i, e.target.value)}
                placeholder={`Gratitude ${i + 1}...`}
                className="resize-none min-h-[80px]"
              />
            </div>
          ))}
        </div>

        {/* Counter */}
        <p className="text-center text-sm text-muted-foreground">
          {filledCount}/3 gratitudes added
        </p>

        {/* Submit button */}
        <div className="flex justify-center">
          <Button
            onClick={saveCompletion}
            disabled={filledCount === 0 || isSubmitting}
            size="lg"
            className="gap-2"
          >
            <Heart className="h-4 w-4" />
            Save Gratitude
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
