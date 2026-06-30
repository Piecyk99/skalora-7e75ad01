import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { WebsiteLead } from "@/integrations/supabase/types";

const KEY = ["website_leads"] as const;

// Leady z formularza skalora.pl. RLS: widoczne dla każdego pracownika.
export function useWebsiteLeads() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<WebsiteLead[]> => {
      const { data, error } = await supabase
        .from("website_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Zmiana statusu / przypisania (RLS: pracownik).
export function useUpdateWebsiteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<Pick<WebsiteLead, "status" | "assigned_to">> }) => {
      const { data, error } = await supabase
        .from("website_leads")
        .update(vars.patch as never)
        .eq("id", vars.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as WebsiteLead;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
