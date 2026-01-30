import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;
  notes: string | null;
  created_at: string;
}

export function useMoodEntries() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [todaysMood, setTodaysMood] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;

      const typedData = data as MoodEntry[];
      setEntries(typedData);

      // Check if there's an entry from today
      const today = new Date().toDateString();
      const todaysEntry = typedData.find(
        (entry) => new Date(entry.created_at).toDateString() === today
      );
      setTodaysMood(todaysEntry || null);
    } catch (err) {
      console.error("Error fetching mood entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const logMood = async (moodScore: number, notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("mood_entries")
      .insert({
        user_id: user.id,
        mood_score: moodScore,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    const newEntry = data as MoodEntry;
    setEntries((prev) => [newEntry, ...prev]);
    setTodaysMood(newEntry);
    return newEntry;
  };

  return { entries, todaysMood, loading, logMood, refetch: fetchEntries };
}
