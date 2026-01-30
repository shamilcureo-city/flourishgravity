import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useMoodEntries } from "@/hooks/useMoodEntries";
import { AppLayout } from "@/components/layout/AppLayout";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MoodWidget } from "@/components/dashboard/MoodWidget";
import { DailyQuote } from "@/components/dashboard/DailyQuote";
import { MoodLogger } from "@/components/dashboard/MoodLogger";

const Dashboard = () => {
  const [isMoodLoggerOpen, setIsMoodLoggerOpen] = useState(false);
  const { profile } = useProfile();
  const { todaysMood, logMood } = useMoodEntries();

  const handleLogMood = async (score: number, notes?: string) => {
    await logMood(score, notes);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
    </AppLayout>
  );
};

export default Dashboard;
