import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Psychologist {
  id: string;
  user_id: string;
  license_number: string;
  specializations: string[];
  bio: string | null;
  hourly_rate: number;
  profile_photo_url: string | null;
  is_verified: boolean;
  rating_avg: number;
  total_reviews: number;
  years_experience: number;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  psychologist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export function usePsychologists(filters?: { specialization?: string }) {
  return useQuery({
    queryKey: ["psychologists", filters],
    queryFn: async () => {
      let query = supabase
        .from("psychologists")
        .select("*")
        .eq("is_verified", true)
        .order("rating_avg", { ascending: false });

      if (filters?.specialization) {
        query = query.contains("specializations", [filters.specialization]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Psychologist[];
    },
  });
}

export function usePsychologist(id: string) {
  return useQuery({
    queryKey: ["psychologist", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("psychologists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Psychologist;
    },
    enabled: !!id,
  });
}

export function useMyPsychologistProfile() {
  return useQuery({
    queryKey: ["my-psychologist-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("psychologists")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Psychologist | null;
    },
  });
}

export function usePsychologistAvailability(psychologistId: string) {
  return useQuery({
    queryKey: ["availability", psychologistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("psychologist_id", psychologistId)
        .eq("is_active", true)
        .order("day_of_week");

      if (error) throw error;
      return data as Availability[];
    },
    enabled: !!psychologistId,
  });
}

export function useCreatePsychologistProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: {
      license_number: string;
      specializations: string[];
      bio: string;
      hourly_rate: number;
      years_experience: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("psychologists")
        .insert({
          user_id: user.id,
          ...profile,
        })
        .select()
        .single();

      if (error) throw error;

      // Add psychologist role
      await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: "psychologist" });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-psychologist-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
    },
  });
}

export function useUpdatePsychologistProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Psychologist>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("psychologists")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-psychologist-profile"] });
    },
  });
}

export function useManageAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      psychologistId,
      availability,
    }: {
      psychologistId: string;
      availability: Omit<Availability, "id" | "psychologist_id">[];
    }) => {
      // Delete existing availability
      await supabase
        .from("availability")
        .delete()
        .eq("psychologist_id", psychologistId);

      // Insert new availability
      if (availability.length > 0) {
        const { error } = await supabase.from("availability").insert(
          availability.map((a) => ({
            ...a,
            psychologist_id: psychologistId,
          }))
        );
        if (error) throw error;
      }
    },
    onSuccess: (_, { psychologistId }) => {
      queryClient.invalidateQueries({ queryKey: ["availability", psychologistId] });
    },
  });
}
