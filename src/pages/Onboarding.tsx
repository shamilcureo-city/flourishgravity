import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { Sparkles, Target, MessageCircle, User, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
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
  {
    id: "supportive",
    title: "Gentle & Supportive",
    description: "Warm encouragement with empathy and understanding",
    icon: "💚",
  },
  {
    id: "direct",
    title: "Direct & Practical",
    description: "Clear, actionable advice without fluff",
    icon: "🎯",
  },
  {
    id: "structured",
    title: "Structured & Guided",
    description: "Step-by-step exercises and frameworks",
    icon: "📋",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [communicationStyle, setCommunicationStyle] = useState("supportive");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return true; // Welcome screen
      case 1:
        return displayName.trim().length > 0;
      case 2:
        return selectedGoals.length > 0;
      case 3:
        return communicationStyle !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        display_name: displayName,
        goals: selectedGoals,
        communication_style: communicationStyle,
        onboarding_completed: true,
      });
      toast.success("Welcome to Flourish!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save your preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-wellness-radial flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i <= step ? "bg-primary w-8" : "bg-muted w-2"
              )}
            />
          ))}
        </div>

        <Card className="border-0 shadow-soft-lg animate-fade-in">
          <CardContent className="p-8">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-wellness-growth mx-auto flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    Welcome to Flourish
                  </h1>
                  <p className="text-muted-foreground">
                    Your personal AI companion for mental wellness. Let's set up your experience in just a few steps.
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Display Name */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-wellness-warmth mx-auto flex items-center justify-center mb-4">
                    <User className="w-7 h-7 text-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    What should we call you?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    We'll use this to personalize your experience
                  </p>
                </div>
                <Input
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-center text-lg h-12"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-wellness-growth mx-auto flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    What are your goals?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Select all that apply - you can change these later
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        selectedGoals.includes(goal.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      <span className="text-2xl mb-2 block">{goal.icon}</span>
                      <span className="text-sm font-medium text-foreground">
                        {goal.label}
                      </span>
                      {selectedGoals.includes(goal.id) && (
                        <Check className="w-4 h-4 text-primary absolute top-2 right-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Communication Style */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-wellness-peace mx-auto flex items-center justify-center mb-4">
                    <MessageCircle className="w-7 h-7 text-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    How would you like Flourish to communicate?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    This helps tailor responses to your preference
                  </p>
                </div>
                <div className="space-y-3">
                  {COMMUNICATION_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setCommunicationStyle(style.id)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        communicationStyle === style.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{style.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">
                            {style.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {style.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  "Saving..."
                ) : step === 3 ? (
                  <>
                    Get Started
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
