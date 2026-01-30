import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, LogOut, User, Target, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS = [
  { id: "anxiety", label: "Managing Anxiety", icon: "🧘" },
  { id: "mood", label: "Improving Mood", icon: "☀️" },
  { id: "habits", label: "Building Healthy Habits", icon: "🌱" },
  { id: "relationships", label: "Better Relationships", icon: "💝" },
  { id: "sleep", label: "Better Sleep", icon: "🌙" },
  { id: "stress", label: "Reducing Stress", icon: "🌊" },
];

const COMMUNICATION_STYLES = [
  { id: "supportive", title: "Gentle & Supportive", icon: "💚" },
  { id: "direct", title: "Direct & Practical", icon: "🎯" },
  { id: "structured", title: "Structured & Guided", icon: "📋" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { profile, loading, updateProfile } = useProfile();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile?.goals || []);
  const [communicationStyle, setCommunicationStyle] = useState(profile?.communication_style || "supportive");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when profile loads
  useState(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setSelectedGoals(profile.goals || []);
      setCommunicationStyle(profile.communication_style || "supportive");
    }
  });

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName,
        goals: selectedGoals,
        communication_style: communicationStyle,
      });
      toast.success("Settings saved!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

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
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-wellness-warmth flex items-center justify-center">
                <User className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals Card */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-wellness-growth flex items-center justify-center">
                <Target className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Goals</CardTitle>
                <CardDescription>What you're working on</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all text-sm",
                    selectedGoals.includes(goal.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="mr-2">{goal.icon}</span>
                  {goal.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Communication Style Card */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-wellness-peace flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Communication Style</CardTitle>
                <CardDescription>How Flourish talks to you</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {COMMUNICATION_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setCommunicationStyle(style.id)}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3",
                    communicationStyle === style.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-xl">{style.icon}</span>
                  <span className="font-medium">{style.title}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
