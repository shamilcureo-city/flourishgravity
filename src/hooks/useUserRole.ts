import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "client" | "psychologist" | "admin";

export function useUserRole() {
  const { data: roles, isLoading, error } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      return data?.map((r) => r.role as AppRole) || [];
    },
  });

  const hasRole = (role: AppRole) => roles?.includes(role) ?? false;
  const isPsychologist = hasRole("psychologist");
  const isAdmin = hasRole("admin");
  const isClient = hasRole("client") || (!isPsychologist && !isAdmin);

  return {
    roles: roles || [],
    isLoading,
    error,
    hasRole,
    isPsychologist,
    isAdmin,
    isClient,
  };
}
