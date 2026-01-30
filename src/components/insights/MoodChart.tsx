import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { MoodEntry } from "@/hooks/useMoodEntries";

interface MoodChartProps {
  entries: MoodEntry[];
}

const moodEmojis: Record<number, string> = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "🙂",
  5: "😊",
};

export function MoodChart({ entries }: MoodChartProps) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      const dayEntries = entries.filter(
        (e) => startOfDay(new Date(e.created_at)).getTime() === date.getTime()
      );
      const avgMood = dayEntries.length
        ? dayEntries.reduce((sum, e) => sum + e.mood_score, 0) / dayEntries.length
        : null;

      return {
        date: format(date, "EEE"),
        fullDate: format(date, "MMM d"),
        mood: avgMood,
      };
    });
    return last7Days;
  }, [entries]);

  const hasData = chartData.some((d) => d.mood !== null);

  if (!hasData) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        <p className="text-center">
          No mood data yet.<br />
          <span className="text-sm">Start logging to see your trends!</span>
        </p>
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => moodEmojis[value] || ""}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const mood = data.mood;
                return (
                  <div className="bg-popover border rounded-lg shadow-lg p-3">
                    <p className="text-sm font-medium text-foreground">{data.fullDate}</p>
                    {mood ? (
                      <p className="text-lg">
                        {moodEmojis[Math.round(mood)]} {mood.toFixed(1)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No entry</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
