import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, Heart, Cloud } from "lucide-react";
import { toast } from "sonner";

interface MoodLoggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogMood: (score: number, notes?: string) => Promise<void>;
}

const moods = [
  { score: 1, icon: Frown, label: "Struggling", color: "hover:bg-red-100 hover:border-red-300 data-[selected=true]:bg-red-100 data-[selected=true]:border-red-400" },
  { score: 2, icon: Cloud, label: "Low", color: "hover:bg-orange-100 hover:border-orange-300 data-[selected=true]:bg-orange-100 data-[selected=true]:border-orange-400" },
  { score: 3, icon: Meh, label: "Okay", color: "hover:bg-yellow-100 hover:border-yellow-300 data-[selected=true]:bg-yellow-100 data-[selected=true]:border-yellow-400" },
  { score: 4, icon: Smile, label: "Good", color: "hover:bg-lime-100 hover:border-lime-300 data-[selected=true]:bg-lime-100 data-[selected=true]:border-lime-400" },
  { score: 5, icon: Heart, label: "Great", color: "hover:bg-green-100 hover:border-green-300 data-[selected=true]:bg-green-100 data-[selected=true]:border-green-400" },
];

export function MoodLogger({ open, onOpenChange, onLogMood }: MoodLoggerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error("Please select how you're feeling");
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogMood(selectedMood, notes.trim() || undefined);
      toast.success("Mood logged successfully!");
      onOpenChange(false);
      setSelectedMood(null);
      setNotes("");
    } catch (error) {
      console.error("Error logging mood:", error);
      toast.error("Failed to log mood. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How are you feeling?</DialogTitle>
          <DialogDescription>
            Take a moment to check in with yourself. There's no right or wrong answer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-between gap-2">
            {moods.map((mood) => (
              <button
                key={mood.score}
                onClick={() => setSelectedMood(mood.score)}
                data-selected={selectedMood === mood.score}
                className={`flex flex-col items-center p-3 rounded-xl border-2 border-transparent transition-all ${mood.color}`}
              >
                <mood.icon className="h-8 w-8 mb-1" />
                <span className="text-xs font-medium">{mood.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Add a note (optional)
            </label>
            <Textarea
              placeholder="What's on your mind?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedMood || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Saving..." : "Log Mood"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
