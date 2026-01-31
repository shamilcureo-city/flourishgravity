import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
export type AppointmentType = "video" | "chat";

export interface Appointment {
  id: string;
  psychologist_id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  type: AppointmentType;
  session_notes: string | null;
  room_id: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  psychologist?: {
    id: string;
    bio: string | null;
    hourly_rate: number;
    profile_photo_url: string | null;
    specializations: string[];
  };
}

export function useClientAppointments() {
  return useQuery({
    queryKey: ["client-appointments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          psychologist:psychologists(id, bio, hourly_rate, profile_photo_url, specializations)
        `)
        .eq("client_id", user.id)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
  });
}

export function usePsychologistAppointments() {
  return useQuery({
    queryKey: ["psychologist-appointments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get the psychologist profile
      const { data: psychologist } = await supabase
        .from("psychologists")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!psychologist) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("psychologist_id", psychologist.id)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      psychologistId,
      startTime,
      endTime,
      type = "video",
    }: {
      psychologistId: string;
      startTime: string;
      endTime: string;
      type?: AppointmentType;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          psychologist_id: psychologistId,
          client_id: user.id,
          start_time: startTime,
          end_time: endTime,
          type,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-appointments"] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      status?: AppointmentStatus;
      session_notes?: string;
      room_id?: string;
      cancellation_reason?: string;
    }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["psychologist-appointments"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["psychologist-appointments"] });
    },
  });
}
