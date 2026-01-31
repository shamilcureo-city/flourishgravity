import { PsychologistLayout } from "@/components/psychologist/PsychologistLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePsychologistAppointments, Appointment } from "@/hooks/useAppointments";
import { format, parseISO } from "date-fns";
import { Video, MessageCircle, Calendar } from "lucide-react";

const PsychologistClients = () => {
  const { data: appointments = [], isLoading } = usePsychologistAppointments();

  // Get unique clients from appointments
  const clientIds = [...new Set(appointments.map((apt) => apt.client_id))];

  const getClientAppointments = (clientId: string) => {
    return appointments
      .filter((apt) => apt.client_id === clientId)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  };

  if (isLoading) {
    return (
      <PsychologistLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            View your client history and session notes
          </p>
        </div>

        {clientIds.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No clients yet. Appointments will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {clientIds.map((clientId) => {
              const clientAppts = getClientAppointments(clientId);
              const completedCount = clientAppts.filter(
                (a) => a.status === "completed"
              ).length;

              return (
                <Card key={clientId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Client {clientId.slice(0, 8)}...
                        </CardTitle>
                        <CardDescription>
                          {completedCount} completed session
                          {completedCount !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {clientAppts.length} total appointments
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {clientAppts.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {apt.type === "video" ? (
                              <Video className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>
                              {format(parseISO(apt.start_time), "MMM d, yyyy h:mm a")}
                            </span>
                          </div>
                          <Badge
                            variant={
                              apt.status === "completed"
                                ? "default"
                                : apt.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {apt.status}
                          </Badge>
                        </div>
                      ))}
                      {clientAppts.length > 3 && (
                        <p className="text-sm text-muted-foreground pt-2">
                          +{clientAppts.length - 3} more appointments
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PsychologistLayout>
  );
};

export default PsychologistClients;
