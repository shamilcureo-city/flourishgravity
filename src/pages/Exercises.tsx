import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BreathingExercise } from "@/components/exercises/BreathingExercise";
import { GroundingExercise } from "@/components/exercises/GroundingExercise";
import { GratitudeJournal } from "@/components/exercises/GratitudeJournal";
import { Wind, Eye, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExerciseType = "none" | "breathing" | "grounding" | "gratitude";

const exercises = [
  {
    id: "breathing" as const,
    title: "Breathing Exercise",
    description: "Calm your nervous system with guided breathing",
    icon: Wind,
    color: "bg-wellness-peace",
    emoji: "🌬️",
  },
  {
    id: "grounding" as const,
    title: "5-4-3-2-1 Grounding",
    description: "Anchor yourself to the present moment",
    icon: Eye,
    color: "bg-wellness-growth",
    emoji: "🌿",
  },
  {
    id: "gratitude" as const,
    title: "Gratitude Journal",
    description: "Shift your perspective with daily gratitude",
    icon: Heart,
    color: "bg-wellness-warmth",
    emoji: "💝",
  },
];

export default function Exercises() {
  const [activeExercise, setActiveExercise] = useState<ExerciseType>("none");

  const handleComplete = () => {
    setActiveExercise("none");
  };

  if (activeExercise === "breathing") {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Button variant="ghost" onClick={() => setActiveExercise("none")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Button>
          <BreathingExercise onComplete={handleComplete} />
        </div>
      </AppLayout>
    );
  }

  if (activeExercise === "grounding") {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Button variant="ghost" onClick={() => setActiveExercise("none")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Button>
          <GroundingExercise onComplete={handleComplete} />
        </div>
      </AppLayout>
    );
  }

  if (activeExercise === "gratitude") {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Button variant="ghost" onClick={() => setActiveExercise("none")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Button>
          <GratitudeJournal onComplete={handleComplete} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Wellness Toolkit</h1>
          <p className="text-muted-foreground">Interactive exercises for your mental wellbeing</p>
        </div>

        <div className="grid gap-4">
          {exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="border-0 shadow-soft cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
              onClick={() => setActiveExercise(exercise.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${exercise.color} flex items-center justify-center text-2xl`}>
                    {exercise.emoji}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{exercise.title}</CardTitle>
                    <CardDescription>{exercise.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
