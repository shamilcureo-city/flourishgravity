import { useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Star, ArrowLeft, Video, MessageCircle, Clock, Check } from "lucide-react";
import { usePsychologist, usePsychologistAvailability } from "@/hooks/usePsychologists";
import { useBookAppointment } from "@/hooks/useAppointments";
import { toast } from "@/hooks/use-toast";
import { format, addDays, setHours, setMinutes, isBefore, startOfDay, addMinutes } from "date-fns";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const BookAppointment = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentType = (searchParams.get("type") as "video" | "chat") || "video";

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [duration, setDuration] = useState<30 | 60>(60);
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: psychologist, isLoading } = usePsychologist(id!);
  const { data: availability = [] } = usePsychologistAvailability(id!);
  const bookAppointment = useBookAppointment();

  // Get available time slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate || !availability.length) return TIME_SLOTS;

    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.filter((a) => a.day_of_week === dayOfWeek);

    if (dayAvailability.length === 0) return [];

    // Filter slots based on availability windows
    return TIME_SLOTS.filter((slot) => {
      const [hours, minutes] = slot.split(":").map(Number);
      const slotTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;

      return dayAvailability.some((a) => {
        return slotTime >= a.start_time && slotTime < a.end_time;
      });
    });
  }, [selectedDate, availability]);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !psychologist) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const startTime = setMinutes(setHours(selectedDate, hours), minutes);
    const endTime = addMinutes(startTime, duration);

    try {
      await bookAppointment.mutateAsync({
        psychologistId: psychologist.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        type: appointmentType,
      });

      toast({
        title: "Appointment booked!",
        description: `Your ${appointmentType} session is scheduled for ${format(startTime, "MMMM d 'at' h:mm a")}`,
      });

      navigate("/appointments");
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "There was an error booking your appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!psychologist) {
    return (
      <AppLayout>
        <div className="p-6">
          <p>Psychologist not found</p>
        </div>
      </AppLayout>
    );
  }

  const totalCost = (psychologist.hourly_rate * duration) / 60;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/consultations")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Psychologist Info */}
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={psychologist.profile_photo_url || undefined} />
                  <AvatarFallback className="text-xl">
                    {psychologist.bio?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>Licensed Psychologist</CardTitle>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {psychologist.rating_avg ? psychologist.rating_avg.toFixed(1) : "New"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({psychologist.total_reviews} reviews)
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {psychologist.bio}
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                {psychologist.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">Rate</p>
                <p className="text-xl font-bold text-primary">
                  ${psychologist.hourly_rate}/hr
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {appointmentType === "video" ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <MessageCircle className="h-5 w-5" />
                )}
                Book {appointmentType === "video" ? "Video" : "Chat"} Session
              </CardTitle>
              <CardDescription>
                Select a date and time for your session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duration Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Session Duration</label>
                <div className="flex gap-2">
                  <Button
                    variant={duration === 30 ? "default" : "outline"}
                    onClick={() => setDuration(30)}
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    30 min - ${(psychologist.hourly_rate / 2).toFixed(2)}
                  </Button>
                  <Button
                    variant={duration === 60 ? "default" : "outline"}
                    onClick={() => setDuration(60)}
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    60 min - ${psychologist.hourly_rate.toFixed(2)}
                  </Button>
                </div>
              </div>

              {/* Calendar */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime(undefined);
                  }}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  className="rounded-md border"
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Available Times for {format(selectedDate, "MMMM d, yyyy")}
                  </label>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No available slots for this date
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Button */}
              {selectedDate && selectedTime && (
                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {format(selectedDate, "EEEE, MMMM d")} at {selectedTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {duration} minute {appointmentType} session
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">${totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleBook}
                    disabled={bookAppointment.isPending}
                  >
                    {bookAppointment.isPending ? (
                      "Booking..."
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default BookAppointment;
