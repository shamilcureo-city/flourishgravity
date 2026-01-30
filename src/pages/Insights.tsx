import { useMoodEntries } from "@/hooks/useMoodEntries";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodChart } from "@/components/insights/MoodChart";
import { MoodCalendar } from "@/components/insights/MoodCalendar";
import { MoodStats } from "@/components/insights/MoodStats";
import { Loader2 } from "lucide-react";

export default function Insights() {
  const { entries, loading } = useMoodEntries();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mood Insights</h1>
          <p className="text-muted-foreground">Track your emotional patterns over time</p>
        </div>

        <MoodStats entries={entries} />

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodChart entries={entries} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodCalendar entries={entries} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
