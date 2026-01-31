import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Video, MessageCircle, Clock, X } from "lucide-react";
import { useClientAppointments, useCancelAppointment, Appointment } from "@/hooks/useAppointments";
import { format, parseISO, isPast, isToday, isFuture } from "date-fns";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
  no_show: "bg-gray-100 text-gray-800",
};

const MyAppointments = () => {
  const navigate = useNavigate();
  const { data: appointments = [], isLoading } = useClientAppointments();
  const cancelAppointment = useCancelAppointment();

  const upcomingAppointments = appointments.filter(
    (apt) =>
      isFuture(parseISO(apt.start_time)) &&
      (apt.status === "pending" || apt.status === "confirmed")
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      isPast(parseISO(apt.end_time)) ||
      apt.status === "completed" ||
      apt.status === "cancelled"
  );

  const handleCancel = async (appointmentId: string) => {
    try {
      await cancelAppointment.mutateAsync({ id: appointmentId });
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const startTime = parseISO(appointment.start_time);
    const endTime = parseISO(appointment.end_time);
    const canCancel =
      isFuture(startTime) &&
      (appointment.status === "pending" || appointment.status === "confirmed");
    const canJoin =
      (isToday(startTime) || isFuture(startTime)) &&
      appointment.status === "confirmed";

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                {appointment.type === "video" ? (
                  <Video className="w-6 h-6 text-primary" />
                ) : (
                  <MessageCircle className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {appointment.type === "video" ? "Video Session" : "Chat Session"}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                  </span>
                </div>
              </div>
            </div>
            <Badge className={statusColors[appointment.status]}>
              {appointment.status}
            </Badge>
          </div>

          {(canJoin || canCancel) && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              {canJoin && (
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/session/${appointment.id}`)}
                >
                  Join Session
                </Button>
              )}
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this appointment? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancel(appointment.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
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

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground">
              View and manage your consultation sessions
            </p>
          </div>
          <Button onClick={() => navigate("/consultations")}>
            Book New Session
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No upcoming appointments
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/consultations")}
                  >
                    Find a Psychologist
                  </Button>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-center">
                    No past appointments
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default MyAppointments;
