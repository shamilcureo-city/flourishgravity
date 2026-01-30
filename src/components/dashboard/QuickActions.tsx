import { MessageCircle, Smile, TrendingUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickActionsProps {
  onLogMood: () => void;
}

export function QuickActions({ onLogMood }: QuickActionsProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const actions = [
    {
      icon: MessageCircle,
      label: "Start Chat",
      description: "Talk with your AI companion",
      onClick: () => navigate("/chat"),
      primary: true,
    },
    {
      icon: Smile,
      label: "Log Mood",
      description: "Track how you're feeling",
      onClick: onLogMood,
      primary: false,
    },
    {
      icon: TrendingUp,
      label: "View Insights",
      description: "See your progress",
      onClick: () => toast.info("Insights coming in Phase 3!"),
      primary: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Card
            key={action.label}
            className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
              action.primary
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-accent/50"
            }`}
            onClick={action.onClick}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  action.primary
                    ? "bg-primary-foreground/20"
                    : "bg-primary/10"
                }`}
              >
                <action.icon
                  className={`h-5 w-5 ${
                    action.primary ? "text-primary-foreground" : "text-primary"
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`font-medium ${
                    action.primary ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {action.label}
                </h3>
                <p
                  className={`text-sm ${
                    action.primary
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {action.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
