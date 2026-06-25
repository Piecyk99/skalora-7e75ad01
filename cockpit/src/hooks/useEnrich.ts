import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface EnrichResult {
  target: "lead" | "prospect";
  processed: number;
  updated: number;
  results: Array<{ firma: string; email?: string; telefon?: string; www?: string; error?: string }>;
}

// Dociąganie kontaktów (e-mail/telefon/www) przez agenta web-search.
// Tryb pojedynczy: { target, id }. Tryb hurtowy: { target, limit } (uzupełnia puste).
export function useEnrichContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { target: "lead" | "prospect"; id?: string; limit?: number }) => {
      const { data, error } = await supabase.functions.invoke("enrich-contact", {
        body: { target: vars.target, id: vars.id, limit: vars.limit ?? 8 },
      });
      if (error) throw error;
      return data as EnrichResult;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [vars.target === "lead" ? "partner_leads" : "prospects"] });
    },
  });
}
