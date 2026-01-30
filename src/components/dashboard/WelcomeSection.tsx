import { Sparkles } from "lucide-react";

interface WelcomeSectionProps {
  displayName: string | null;
}

export function WelcomeSection({ displayName }: WelcomeSectionProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const name = displayName || "friend";

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-primary">Welcome back</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
        {getGreeting()}, {name}
      </h1>
      <p className="text-muted-foreground">
        How are you feeling today? Take a moment to check in with yourself.
      </p>
    </div>
  );
}
