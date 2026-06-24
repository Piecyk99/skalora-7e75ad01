import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { callRpc } from "@/lib/rpc";

export function useUpdateOutreach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; temat: string; tresc: string }) =>
      callRpc("rpc_update_outreach", { p_id: vars.id, p_temat: vars.temat, p_tresc: vars.tresc }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outreach"] }),
  });
}

export function useApproveOutreach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string }) => callRpc("rpc_approve_outreach", { p_id: vars.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outreach"] }),
  });
}

// Agent-copywriter (Edge Function) — generuje drafty dla leadów bez outreachu. Bez wysyłki.
export function useRunCopywriter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars?: { limit?: number }) => {
      const { data, error } = await supabase.functions.invoke("copywriter", {
        body: { limit: vars?.limit ?? 10 },
      });
      if (error) throw error;
      return data as { engine: string; model: string | null; drafted: number };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outreach"] }),
  });
}

// Wysyłka zaakceptowanego outreachu (Edge Function send-outreach). approve -> sent.
export function useSendOutreach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string }) => {
      const { data, error } = await supabase.functions.invoke("send-outreach", { body: { id: vars.id } });
      if (error) {
        // wyciągnij komunikat z odpowiedzi funkcji (np. brak zgody RODO / brak e-maila)
        let msg = error.message;
        try { const ctx = await (error as { context?: Response }).context?.json(); if (ctx?.error) msg = ctx.error; } catch { /* */ }
        throw new Error(msg);
      }
      return data as { ok: boolean; mode: string; to: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outreach"] }),
  });
}

// Ręczne oznaczenie odpowiedzi (Resend nie dostarcza 'replied' webhookiem). sent/bounced -> replied.
export function useMarkReplied() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string }) => callRpc("rpc_mark_outreach_replied", { p_id: vars.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outreach"] }),
  });
}

