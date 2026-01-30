import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useMoodEntries } from "@/hooks/useMoodEntries";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MoodWidget } from "@/components/dashboard/MoodWidget";
import { DailyQuote } from "@/components/dashboard/DailyQuote";
import { MoodLogger } from "@/components/dashboard/MoodLogger";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isMoodLoggerOpen, setIsMoodLoggerOpen] = useState(false);
  
  const { profile, loading: profileLoading } = useProfile();
  const { todaysMood, logMood, loading: moodLoading } = useMoodEntries();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setIsAuthLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const isLoading = isAuthLoading || profileLoading || moodLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const handleLogMood = async (score: number, notes?: string) => {
    await logMood(score, notes);
  };

  return (
    <div className="min-h-screen bg-wellness-radial">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <WelcomeSection displayName={profile?.display_name || null} />
        
        <div className="space-y-6">
          <QuickActions onLogMood={() => setIsMoodLoggerOpen(true)} />
          
          <div className="grid md:grid-cols-2 gap-6">
            <MoodWidget 
              todaysMood={todaysMood} 
              onLogMood={() => setIsMoodLoggerOpen(true)} 
            />
            <DailyQuote />
          </div>
        </div>

        <MoodLogger
          open={isMoodLoggerOpen}
          onOpenChange={setIsMoodLoggerOpen}
          onLogMood={handleLogMood}
        />
      </div>
    </div>
  );
};

export default Dashboard;
