import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreathingExerciseProps {
  onComplete?: () => void;
}

type BreathingPattern = {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
};

const patterns: BreathingPattern[] = [
  { name: "4-7-8 Relaxing", inhale: 4, hold: 7, exhale: 8, cycles: 4 },
  { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4, cycles: 4 },
  { name: "Simple Calm", inhale: 4, hold: 0, exhale: 6, cycles: 6 },
];

type Phase = "inhale" | "hold" | "exhale" | "idle";

export function BreathingExercise({ onComplete }: BreathingExerciseProps) {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(patterns[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const getPhaseInstruction = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      default:
        return "Ready?";
    }
  };

  const saveCompletion = useCallback(async (durationSeconds: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("exercise_completions").insert({
        user_id: user.id,
        exercise_type: "breathing",
        duration_seconds: durationSeconds,
        notes: selectedPattern.name,
      });

      toast.success("Exercise completed! Great job! 🎉");
    } catch (error) {
      console.error("Error saving completion:", error);
    }
  }, [selectedPattern.name]);

  useEffect(() => {
    if (!isRunning) return;

    const runCycle = async () => {
      // Inhale phase
      setPhase("inhale");
      for (let i = selectedPattern.inhale; i > 0; i--) {
        setCountdown(i);
        await new Promise((r) => setTimeout(r, 1000));
        if (!isRunning) return;
      }

      // Hold phase (skip if 0)
      if (selectedPattern.hold > 0) {
        setPhase("hold");
        for (let i = selectedPattern.hold; i > 0; i--) {
          setCountdown(i);
          await new Promise((r) => setTimeout(r, 1000));
          if (!isRunning) return;
        }
      }

      // Exhale phase
      setPhase("exhale");
      for (let i = selectedPattern.exhale; i > 0; i--) {
        setCountdown(i);
        await new Promise((r) => setTimeout(r, 1000));
        if (!isRunning) return;
      }
    };

    const runExercise = async () => {
      for (let cycle = 1; cycle <= selectedPattern.cycles; cycle++) {
        setCurrentCycle(cycle);
        await runCycle();
        if (!isRunning) return;
      }

      // Exercise complete
      setIsRunning(false);
      setPhase("idle");
      setCurrentCycle(0);

      if (startTime) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        await saveCompletion(duration);
      }

      onComplete?.();
    };

    runExercise();
  }, [isRunning, selectedPattern, startTime, saveCompletion, onComplete]);

  const handleStart = () => {
    setStartTime(Date.now());
    setIsRunning(true);
    setCurrentCycle(1);
  };

  const handlePause = () => {
    setIsRunning(false);
    setPhase("idle");
    setCurrentCycle(0);
    setCountdown(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase("idle");
    setCurrentCycle(0);
    setCountdown(0);
    setStartTime(null);
  };

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">🌬️ Breathing Exercise</CardTitle>
        <p className="text-muted-foreground">Follow the circle and breathe</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pattern selector */}
        <div className="flex gap-2 justify-center flex-wrap">
          {patterns.map((pattern) => (
            <Button
              key={pattern.name}
              variant={selectedPattern.name === pattern.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPattern(pattern)}
              disabled={isRunning}
            >
              {pattern.name}
            </Button>
          ))}
        </div>

        {/* Breathing circle */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Outer ring */}
            <div
              className={cn(
                "absolute inset-0 rounded-full border-4 border-primary/20 transition-all duration-1000",
                phase === "inhale" && "scale-110 border-primary/60",
                phase === "hold" && "scale-110 border-primary/40",
                phase === "exhale" && "scale-100 border-primary/20"
              )}
            />
            {/* Inner circle */}
            <div
              className={cn(
                "w-32 h-32 rounded-full bg-primary/10 flex flex-col items-center justify-center transition-all duration-1000",
                phase === "inhale" && "scale-125 bg-primary/30",
                phase === "hold" && "scale-125 bg-primary/25",
                phase === "exhale" && "scale-100 bg-primary/10"
              )}
            >
              <span className="text-3xl font-light text-foreground">
                {isRunning ? countdown : "—"}
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                {getPhaseInstruction()}
              </span>
            </div>
          </div>

          {/* Cycle indicator */}
          {isRunning && (
            <p className="text-muted-foreground mt-4">
              Cycle {currentCycle} of {selectedPattern.cycles}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Start
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline" size="lg" className="gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          <Button onClick={handleReset} variant="ghost" size="lg" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
