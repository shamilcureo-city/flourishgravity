import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown, Heart, Sparkles } from "lucide-react";
import type { MoodEntry } from "@/hooks/useMoodEntries";

interface MoodWidgetProps {
  todaysMood: MoodEntry | null;
  onLogMood: () => void;
}

const moodConfig = [
  { score: 1, icon: Frown, label: "Struggling", color: "text-red-500" },
  { score: 2, icon: Frown, label: "Low", color: "text-orange-500" },
  { score: 3, icon: Meh, label: "Okay", color: "text-yellow-500" },
  { score: 4, icon: Smile, label: "Good", color: "text-lime-500" },
  { score: 5, icon: Heart, label: "Great", color: "text-green-500" },
];

export function MoodWidget({ todaysMood, onLogMood }: MoodWidgetProps) {
  const getMoodInfo = (score: number) => {
    return moodConfig.find((m) => m.score === score) || moodConfig[2];
  };

  if (!todaysMood) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Today's Check-in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You haven't logged your mood today. How are you feeling?
          </p>
          <Button onClick={onLogMood} className="w-full">
            Log Your Mood
          </Button>
        </CardContent>
      </Card>
    );
  }

  const moodInfo = getMoodInfo(todaysMood.mood_score);
  const MoodIcon = moodInfo.icon;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Today's Mood
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-full bg-background ${moodInfo.color}`}>
            <MoodIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">
              {moodInfo.label}
            </p>
            <p className="text-sm text-muted-foreground">
              Logged at{" "}
              {new Date(todaysMood.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        {todaysMood.notes && (
          <p className="mt-4 text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
            "{todaysMood.notes}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}
