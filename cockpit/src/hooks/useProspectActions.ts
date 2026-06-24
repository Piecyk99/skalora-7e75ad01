import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { callRpc } from "@/lib/rpc";
import type { ProspectStatus } from "@/integrations/supabase/types";

export function useAddProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { firma_nazwa: string; nip?: string; zrodlo?: string; raw_data?: Record<string, unknown> }) =>
      callRpc("rpc_add_prospect", {
        p_firma_nazwa: vars.firma_nazwa,
        p_nip: vars.nip ?? null,
        p_zrodlo: vars.zrodlo ?? "reczny",
        p_raw_data: vars.raw_data ?? {},
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prospects"] }),
  });
}

export function useSetProspectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: ProspectStatus; score?: number | null }) =>
      callRpc("rpc_set_prospect_status", { p_id: vars.id, p_status: vars.status, p_score: vars.score ?? null }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prospects"] }),
  });
}

export function usePromoteProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string }) => callRpc("rpc_promote_prospect", { p_id: vars.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospects"] });
      qc.invalidateQueries({ queryKey: ["partner_leads"] });
    },
  });
}

// Uruchomienie agenta-prospektora (Edge Function). Ocenia prospekty 'nowy'.
export function useRunProspector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars?: { limit?: number }) => {
      const { data, error } = await supabase.functions.invoke("prospector", {
        body: { limit: vars?.limit ?? 10 },
      });
      if (error) throw error;
      return data as { engine: string; model: string | null; evaluated: number };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prospects"] }),
  });
}

// Uruchomienie agenta-szukacza (Edge Function, web search). Dograje nowe prospekty.
export function useRunFinder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars?: { nisza?: string; limit?: number }) => {
      const { data, error } = await supabase.functions.invoke("lead-finder", {
        body: { nisza: vars?.nisza, limit: vars?.limit ?? 10 },
      });
      if (error) throw error;
      return data as { engine: string; model: string | null; found: number; inserted: number };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prospects"] }),
  });
}
