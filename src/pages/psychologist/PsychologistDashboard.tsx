import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Star, Video, MessageCircle } from "lucide-react";
import { useMyPsychologistProfile } from "@/hooks/usePsychologists";
import { usePsychologistAppointments } from "@/hooks/useAppointments";
import { PsychologistLayout } from "@/components/psychologist/PsychologistLayout";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

const PsychologistDashboard = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useMyPsychologistProfile();
  const { data: appointments = [] } = usePsychologistAppointments();

  useEffect(() => {
    if (!profileLoading && !profile) {
      navigate("/psychologist/login");
    }
  }, [profile, profileLoading, navigate]);

  if (profileLoading) {
    return (
      <PsychologistLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PsychologistLayout>
    );
  }

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "confirmed" || apt.status === "pending"
  );
  
  const todayAppointments = upcomingAppointments.filter((apt) =>
    isToday(parseISO(apt.start_time))
  );

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  return (
    <PsychologistLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your practice overview.
            </p>
          </div>
          {!profile?.is_verified && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Pending Verification
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_reviews || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.rating_avg ? profile.rating_avg.toFixed(1) : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No appointments scheduled for today
              </p>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        {apt.type === "video" ? (
                          <Video className="w-5 h-5 text-primary" />
                        ) : (
                          <MessageCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {format(parseISO(apt.start_time), "h:mm a")} -{" "}
                          {format(parseISO(apt.end_time), "h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {apt.type === "video" ? "Video Session" : "Chat Session"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={apt.status === "confirmed" ? "default" : "secondary"}
                      >
                        {apt.status}
                      </Badge>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled sessions</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate("/psychologist/schedule")}>
              Manage Schedule
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No upcoming appointments
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[60px]">
                        <p className="text-xs text-muted-foreground">
                          {getDateLabel(apt.start_time)}
                        </p>
                        <p className="font-medium">
                          {format(parseISO(apt.start_time), "h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.type === "video" ? (
                          <Video className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm capitalize">{apt.type}</span>
                      </div>
                    </div>
                    <Badge variant={apt.status === "confirmed" ? "default" : "outline"}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PsychologistLayout>
  );
};

export default PsychologistDashboard;
