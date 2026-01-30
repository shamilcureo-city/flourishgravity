import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { Loader2 } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setIsAuthChecking(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!profileLoading && profile && !profile.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [profile, profileLoading, navigate]);

  if (isAuthChecking || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-4 border-b px-4 md:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="hidden md:flex" />
            <div className="flex-1" />
          </header>
          <div className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </SidebarProvider>
  );
}
