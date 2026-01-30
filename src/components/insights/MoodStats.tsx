import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MoodEntry } from "@/hooks/useMoodEntries";
import { TrendingUp, TrendingDown, Minus, Calendar, Target } from "lucide-react";
import { startOfDay, subDays, differenceInDays } from "date-fns";

interface MoodStatsProps {
  entries: MoodEntry[];
}

export function MoodStats({ entries }: MoodStatsProps) {
  const stats = useMemo(() => {
    if (entries.length === 0) {
      return {
        averageMood: null,
        trend: "stable" as const,
        streak: 0,
        totalEntries: 0,
      };
    }

    // Average mood
    const avgMood = entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length;

    // Trend (compare last 7 days to previous 7 days)
    const now = new Date();
    const last7Days = entries.filter((e) => {
      const date = new Date(e.created_at);
      return differenceInDays(now, date) < 7;
    });
    const prev7Days = entries.filter((e) => {
      const date = new Date(e.created_at);
      const diff = differenceInDays(now, date);
      return diff >= 7 && diff < 14;
    });

    let trend: "improving" | "declining" | "stable" = "stable";
    if (last7Days.length > 0 && prev7Days.length > 0) {
      const lastAvg = last7Days.reduce((s, e) => s + e.mood_score, 0) / last7Days.length;
      const prevAvg = prev7Days.reduce((s, e) => s + e.mood_score, 0) / prev7Days.length;
      if (lastAvg > prevAvg + 0.3) trend = "improving";
      else if (lastAvg < prevAvg - 0.3) trend = "declining";
    }

    // Streak calculation
    let streak = 0;
    const today = startOfDay(now);
    for (let i = 0; i < 365; i++) {
      const checkDate = startOfDay(subDays(today, i));
      const hasEntry = entries.some(
        (e) => startOfDay(new Date(e.created_at)).getTime() === checkDate.getTime()
      );
      if (hasEntry) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      averageMood: avgMood,
      trend,
      streak,
      totalEntries: entries.length,
    };
  }, [entries]);

  const moodEmojis: Record<number, string> = {
    1: "😢",
    2: "😔",
    3: "😐",
    4: "🙂",
    5: "😊",
  };

  const trendConfig = {
    improving: { icon: TrendingUp, label: "Improving", color: "text-primary" },
    declining: { icon: TrendingDown, label: "Declining", color: "text-destructive" },
    stable: { icon: Minus, label: "Stable", color: "text-muted-foreground" },
  };

  const TrendIcon = trendConfig[stats.trend].icon;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4 text-center">
          <div className="text-3xl mb-1">
            {stats.averageMood
              ? moodEmojis[Math.round(stats.averageMood)]
              : "—"}
          </div>
          <div className="text-sm text-muted-foreground">Average Mood</div>
          {stats.averageMood && (
            <div className="text-lg font-semibold text-foreground">
              {stats.averageMood.toFixed(1)}/5
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardContent className="p-4 text-center">
          <TrendIcon className={`w-8 h-8 mx-auto mb-1 ${trendConfig[stats.trend].color}`} />
          <div className="text-sm text-muted-foreground">Weekly Trend</div>
          <div className={`font-semibold ${trendConfig[stats.trend].color}`}>
            {trendConfig[stats.trend].label}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-wellness-growth flex items-center justify-center">
            <Calendar className="w-4 h-4 text-foreground" />
          </div>
          <div className="text-sm text-muted-foreground">Current Streak</div>
          <div className="text-lg font-semibold text-foreground">
            {stats.streak} {stats.streak === 1 ? "day" : "days"}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-wellness-peace flex items-center justify-center">
            <Target className="w-4 h-4 text-foreground" />
          </div>
          <div className="text-sm text-muted-foreground">Total Entries</div>
          <div className="text-lg font-semibold text-foreground">
            {stats.totalEntries}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
