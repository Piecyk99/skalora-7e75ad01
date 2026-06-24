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

// Usunięcie prospektu (admin / handlowiec). Promowanego nie da się usunąć (blokada w RPC).
export function useDeleteProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string }) => callRpc("rpc_delete_prospect", { p_id: vars.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospects"] });
      qc.invalidateQueries({ queryKey: ["outreach"] });
      qc.invalidateQueries({ queryKey: ["activity_log"] });
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

// Szukacz OGŁOSZEŃ (Edge Function, web search po publicznych sygnałach popytu).
// Tworzy prospekty zrodlo='ad_search' i opcjonalnie drafty outreach.
export function useRunAdFinder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars?: { nisza?: string; limit?: number; create_drafts?: boolean }) => {
      const { data, error } = await supabase.functions.invoke("ad-finder", {
        body: { nisza: vars?.nisza, limit: vars?.limit ?? 10, create_drafts: vars?.create_drafts ?? true },
      });
      if (error) throw error;
      return data as { engine: string; found: number; inserted: number; drafted: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospects"] });
      qc.invalidateQueries({ queryKey: ["outreach"] });
    },
  });
}

// „Wklej ogłoszenie" (Edge Function). Z wklejonej treści tworzy prospekt + draft outreach.
export function useAdIntake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { text: string; url?: string }) => {
      const { data, error } = await supabase.functions.invoke("ad-intake", {
        body: { text: vars.text, url: vars.url },
      });
      if (error) throw error;
      const res = data as { error?: string; prospect?: { firma_nazwa: string }; draft?: { temat: string } };
      if (res.error) throw new Error(res.error);
      return res as { prospect: { firma_nazwa: string }; draft: { temat: string } };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospects"] });
      qc.invalidateQueries({ queryKey: ["outreach"] });
    },
  });
}
