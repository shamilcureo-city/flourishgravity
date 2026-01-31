-- 1. Create message role enum
CREATE TYPE public.message_role AS ENUM ('user', 'assistant');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  goals TEXT[] DEFAULT '{}',
  communication_style TEXT DEFAULT 'supportive',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create chat_sessions table
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role public.message_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create mood_entries table
CREATE TABLE public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Chat sessions RLS policies
CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON public.chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON public.chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Messages RLS policies (via session ownership)
CREATE POLICY "Users can view messages from their sessions"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their sessions"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Mood entries RLS policies
CREATE POLICY "Users can view their own mood entries"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON public.mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON public.mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Create exercise_completions table for tracking wellness exercises
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


-- 3. Create app_role enum for role management
CREATE TYPE public.app_role AS ENUM ('client', 'psychologist', 'admin');

-- Create user_roles table for secure role storage
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create psychologists table
CREATE TABLE public.psychologists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    license_number TEXT NOT NULL,
    specializations TEXT[] DEFAULT '{}',
    bio TEXT,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    profile_photo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.psychologists ENABLE ROW LEVEL SECURITY;

-- Psychologists RLS policies
CREATE POLICY "Anyone can view verified psychologists"
ON public.psychologists
FOR SELECT
USING (is_verified = true OR auth.uid() = user_id);

CREATE POLICY "Psychologists can insert their own profile"
ON public.psychologists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Psychologists can update their own profile"
ON public.psychologists
FOR UPDATE
USING (auth.uid() = user_id);

-- Create availability table
CREATE TABLE public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    psychologist_id UUID REFERENCES public.psychologists(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Availability RLS policies
CREATE POLICY "Anyone can view active availability"
ON public.availability
FOR SELECT
USING (
    is_active = true 
    OR EXISTS (
        SELECT 1 FROM public.psychologists 
        WHERE psychologists.id = availability.psychologist_id 
        AND psychologists.user_id = auth.uid()
    )
);

CREATE POLICY "Psychologists can manage their own availability"
ON public.availability
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.psychologists 
        WHERE psychologists.id = psychologist_id 
        AND psychologists.user_id = auth.uid()
    )
);

CREATE POLICY "Psychologists can update their own availability"
ON public.availability
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.psychologists 
        WHERE psychologists.id = availability.psychologist_id 
        AND psychologists.user_id = auth.uid()
    )
);

CREATE POLICY "Psychologists can delete their own availability"
ON public.availability
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.psychologists 
        WHERE psychologists.id = availability.psychologist_id 
        AND psychologists.user_id = auth.uid()
    )
);

-- Create appointment_status enum
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- Create appointment_type enum
CREATE TYPE public.appointment_type AS ENUM ('video', 'chat');

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    psychologist_id UUID REFERENCES public.psychologists(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    type appointment_type NOT NULL DEFAULT 'video',
    session_notes TEXT,
    room_id TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_appointment_time CHECK (end_time > start_time)
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments RLS policies
CREATE POLICY "Clients can view their own appointments"
ON public.appointments
FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Psychologists can view their appointments"
ON public.appointments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.psychologists 
        WHERE psychologists.id = appointments.psychologist_id 
        AND psychologists.user_id = auth.uid()
    )
);

CREATE POLICY "Clients can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own appointments"
ON public.appointments
FOR UPDATE
USING (auth.uid() = client_id);

CREATE POLICY "Psychologists can update their appointments"
ON public.appointments
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.psychologists 
        WHERE psychologists.id = appointments.psychologist_id 
        AND psychologists.user_id = auth.uid()
    )
);

-- Create session_chats table for real-time messaging
CREATE TABLE public.session_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_chats ENABLE ROW LEVEL SECURITY;

-- Session chats RLS policies
CREATE POLICY "Participants can view session chats"
ON public.session_chats
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE appointments.id = session_chats.appointment_id 
        AND (
            appointments.client_id = auth.uid() 
            OR EXISTS (
                SELECT 1 FROM public.psychologists 
                WHERE psychologists.id = appointments.psychologist_id 
                AND psychologists.user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Participants can send messages"
ON public.session_chats
FOR INSERT
WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE appointments.id = appointment_id 
        AND (
            appointments.client_id = auth.uid() 
            OR EXISTS (
                SELECT 1 FROM public.psychologists 
                WHERE psychologists.id = appointments.psychologist_id 
                AND psychologists.user_id = auth.uid()
            )
        )
    )
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL UNIQUE,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    psychologist_id UUID REFERENCES public.psychologists(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews RLS policies
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

CREATE POLICY "Clients can create reviews for their completed appointments"
ON public.reviews
FOR INSERT
WITH CHECK (
    auth.uid() = client_id 
    AND EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE appointments.id = appointment_id 
        AND appointments.client_id = auth.uid()
        AND appointments.status = 'completed'
    )
);

-- Create function to update psychologist rating average
CREATE OR REPLACE FUNCTION public.update_psychologist_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.psychologists
    SET 
        rating_avg = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM public.reviews 
            WHERE psychologist_id = NEW.psychologist_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE psychologist_id = NEW.psychologist_id
        )
    WHERE id = NEW.psychologist_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for rating updates
CREATE TRIGGER update_rating_on_review
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_psychologist_rating();

-- Create trigger for updated_at on psychologists
CREATE TRIGGER update_psychologists_updated_at
BEFORE UPDATE ON public.psychologists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on appointments
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for session_chats and appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
