import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { MoodEntry } from "@/hooks/useMoodEntries";
import { cn } from "@/lib/utils";

interface MoodCalendarProps {
  entries: MoodEntry[];
}

const moodColors: Record<number, string> = {
  1: "bg-destructive/60",
  2: "bg-wellness-warmth",
  3: "bg-muted",
  4: "bg-wellness-growth",
  5: "bg-primary/60",
};

export function MoodCalendar({ entries }: MoodCalendarProps) {
  const calendarData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    return days.map((day) => {
      const dayEntry = entries.find((e) =>
        isSameDay(new Date(e.created_at), day)
      );
      const isCurrentMonth = day.getMonth() === now.getMonth();

      return {
        date: day,
        mood: dayEntry?.mood_score || null,
        isCurrentMonth,
        isToday: isSameDay(day, now),
      };
    });
  }, [entries]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <div className="text-center mb-4 font-medium text-foreground">
        {format(new Date(), "MMMM yyyy")}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground font-medium py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((day, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-md flex items-center justify-center text-sm transition-colors",
              !day.isCurrentMonth && "opacity-30",
              day.isToday && "ring-2 ring-primary ring-offset-1",
              day.mood ? moodColors[day.mood] : "bg-muted/30"
            )}
          >
            <span
              className={cn(
                day.mood ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {format(day.date, "d")}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-destructive/60" />
          <span className="text-muted-foreground">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted" />
          <span className="text-muted-foreground">Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary/60" />
          <span className="text-muted-foreground">Great</span>
        </div>
      </div>
    </div>
  );
}
