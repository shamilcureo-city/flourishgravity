import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroundingExerciseProps {
  onComplete?: () => void;
}

const steps = [
  { count: 5, sense: "SEE", emoji: "👀", prompt: "Name 5 things you can see around you" },
  { count: 4, sense: "TOUCH", emoji: "✋", prompt: "Name 4 things you can physically feel" },
  { count: 3, sense: "HEAR", emoji: "👂", prompt: "Name 3 things you can hear right now" },
  { count: 2, sense: "SMELL", emoji: "👃", prompt: "Name 2 things you can smell" },
  { count: 1, sense: "TASTE", emoji: "👅", prompt: "Name 1 thing you can taste" },
];

export function GroundingExercise({ onComplete }: GroundingExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [allResponses, setAllResponses] = useState<string[][]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());

  const step = steps[currentStep];
  const inputCount = step?.count || 0;

  const saveCompletion = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const duration = Math.round((Date.now() - startTime) / 1000);
      await supabase.from("exercise_completions").insert({
        user_id: user.id,
        exercise_type: "grounding",
        duration_seconds: duration,
        notes: JSON.stringify(allResponses),
      });

      toast.success("Grounding complete! You're present 🌿");
    } catch (error) {
      console.error("Error saving completion:", error);
    }
  }, [startTime, allResponses]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleNext = async () => {
    const filledInputs = inputs.filter((i) => i.trim().length > 0);
    setAllResponses([...allResponses, filledInputs]);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setInputs([]);
    } else {
      setIsComplete(true);
      await saveCompletion();
      onComplete?.();
    }
  };

  const isStepComplete = inputs.filter((i) => i.trim().length > 0).length >= inputCount;

  if (isComplete) {
    return (
      <Card className="border-0 shadow-soft">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">🌿 You're Grounded</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-wellness-growth mx-auto flex items-center justify-center">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Great job! You've anchored yourself to the present moment.
          </p>
          <Button onClick={() => {
            setCurrentStep(0);
            setInputs([]);
            setAllResponses([]);
            setIsComplete(false);
          }}>
            Do It Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">🌿 5-4-3-2-1 Grounding</CardTitle>
        <p className="text-muted-foreground">Anchor yourself to the present moment</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                i < currentStep
                  ? "bg-primary"
                  : i === currentStep
                  ? "bg-primary/60 scale-125"
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Current step */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-2">{step.emoji}</div>
          <div className="text-4xl font-light text-primary">{step.count}</div>
          <p className="text-lg font-medium">{step.sense}</p>
          <p className="text-muted-foreground">{step.prompt}</p>
        </div>

        {/* Input fields */}
        <div className="space-y-3">
          {Array.from({ length: inputCount }).map((_, i) => (
            <Input
              key={i}
              value={inputs[i] || ""}
              onChange={(e) => handleInputChange(i, e.target.value)}
              placeholder={`${i + 1}. What do you ${step.sense.toLowerCase()}?`}
              className="text-center"
            />
          ))}
        </div>

        {/* Next button */}
        <div className="flex justify-center">
          <Button
            onClick={handleNext}
            disabled={!isStepComplete}
            size="lg"
            className="gap-2"
          >
            {currentStep < steps.length - 1 ? "Next" : "Complete"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
