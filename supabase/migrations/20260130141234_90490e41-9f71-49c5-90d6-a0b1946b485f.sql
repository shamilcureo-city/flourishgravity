-- Create exercise_completions table for tracking wellness exercises
CREATE TABLE public.exercise_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_type TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own exercise completions"
ON public.exercise_completions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise completions"
ON public.exercise_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise completions"
ON public.exercise_completions
FOR DELETE
USING (auth.uid() = user_id);