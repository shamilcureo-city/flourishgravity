import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PsychologistLayout } from "@/components/psychologist/PsychologistLayout";
import { useMyPsychologistProfile, usePsychologistAvailability, useManageAvailability, Availability } from "@/hooks/usePsychologists";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
];

interface DaySchedule {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

const PsychologistSchedule = () => {
  const { data: profile, isLoading: profileLoading } = useMyPsychologistProfile();
  const { data: existingAvailability = [], isLoading: availabilityLoading } = usePsychologistAvailability(profile?.id || "");
  const manageAvailability = useManageAvailability();

  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>(() => {
    const initial: Record<number, DaySchedule> = {};
    DAYS.forEach((day) => {
      initial[day.value] = { enabled: false, start_time: "09:00", end_time: "17:00" };
    });
    return initial;
  });

  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize schedule from existing availability
  if (!hasInitialized && existingAvailability.length > 0 && !availabilityLoading) {
    const newSchedule: Record<number, DaySchedule> = {};
    DAYS.forEach((day) => {
      const existing = existingAvailability.find((a) => a.day_of_week === day.value);
      if (existing) {
        newSchedule[day.value] = {
          enabled: existing.is_active,
          start_time: existing.start_time.slice(0, 5),
          end_time: existing.end_time.slice(0, 5),
        };
      } else {
        newSchedule[day.value] = { enabled: false, start_time: "09:00", end_time: "17:00" };
      }
    });
    setSchedule(newSchedule);
    setHasInitialized(true);
  }

  const updateDay = (dayValue: number, updates: Partial<DaySchedule>) => {
    setSchedule((prev) => ({
      ...prev,
      [dayValue]: { ...prev[dayValue], ...updates },
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    const availability: Omit<Availability, "id" | "psychologist_id">[] = [];

    DAYS.forEach((day) => {
      const daySchedule = schedule[day.value];
      if (daySchedule.enabled) {
        availability.push({
          day_of_week: day.value,
          start_time: daySchedule.start_time + ":00",
          end_time: daySchedule.end_time + ":00",
          is_active: true,
        });
      }
    });

    try {
      await manageAvailability.mutateAsync({
        psychologistId: profile.id,
        availability,
      });

      toast({
        title: "Schedule saved",
        description: "Your availability has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (profileLoading || availabilityLoading) {
    return (
      <PsychologistLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Availability Schedule</h1>
            <p className="text-muted-foreground">
              Set your weekly availability for client bookings
            </p>
          </div>
          <Button onClick={handleSave} disabled={manageAvailability.isPending}>
            {manageAvailability.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Schedule
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Hours</CardTitle>
            <CardDescription>
              Toggle days on/off and set your working hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DAYS.map((day) => (
              <div
                key={day.value}
                className="flex items-center justify-between py-3 border-b last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <Switch
                    checked={schedule[day.value].enabled}
                    onCheckedChange={(checked) =>
                      updateDay(day.value, { enabled: checked })
                    }
                  />
                  <Label className="w-24 font-medium">{day.label}</Label>
                </div>

                {schedule[day.value].enabled ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={schedule[day.value].start_time}
                      onValueChange={(value) =>
                        updateDay(day.value, { start_time: value })
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">to</span>
                    <Select
                      value={schedule[day.value].end_time}
                      onValueChange={(value) =>
                        updateDay(day.value, { end_time: value })
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.filter(
                          (time) => time > schedule[day.value].start_time
                        ).map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Unavailable</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PsychologistLayout>
  );
};

export default PsychologistSchedule;
