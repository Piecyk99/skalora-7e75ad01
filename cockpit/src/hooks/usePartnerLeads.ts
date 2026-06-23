import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { callRpc } from "@/lib/rpc";
import type { PartnerLead, PartnerStatus } from "@/integrations/supabase/types";

const KEY = ["partner_leads"] as const;

// Lista leadów — RLS sam ogranicza zakres (admin/viewer = wszystko, handlowiec = swoje).
export function usePartnerLeads() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<PartnerLead[]> => {
      const { data, error } = await supabase
        .from("partner_leads")
        .select("*")
        .order("next_action_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// "Moje zadania na dziś": przypisane do mnie z next_action_date <= dziś.
export function useMyTasksToday(userId: string | undefined) {
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: [...KEY, "today", userId, today],
    enabled: !!userId,
    queryFn: async (): Promise<PartnerLead[]> => {
      const { data, error } = await supabase
        .from("partner_leads")
        .select("*")
        .eq("assigned_to", userId!)
        .not("next_action_date", "is", null)
        .lte("next_action_date", today)
        .order("next_action_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// SSOT: zmiana statusu WYŁĄCZNIE przez rpc_partner_lifecycle. Brak update({status}).
export function usePartnerLifecycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { leadId: string; newStatus: PartnerStatus; note?: string }) =>
      callRpc("rpc_partner_lifecycle", {
        p_lead_id: vars.leadId,
        p_new_status: vars.newStatus,
        p_note: vars.note ?? null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["activity_log"] });
    },
  });
}

// Tworzenie firmy + zgody RODO atomowo przez RPC (consents tylko przez RPC).
export function useCreatePartnerLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      firma_nazwa: string;
      nip?: string;
      osoba_kontakt?: string;
      email?: string;
      telefon?: string;
      next_action_date?: string;
      next_action_type?: string;
      kontrakt_wartosc?: number | null;
      prowizja_pct?: number | null;
      consent_wdrozenie: boolean;
      consent_finansowanie: boolean;
      consent_tresc?: string;
    }) =>
      callRpc("rpc_create_partner_lead", {
        p_firma_nazwa: vars.firma_nazwa,
        p_nip: vars.nip ?? null,
        p_osoba_kontakt: vars.osoba_kontakt ?? null,
        p_email: vars.email ?? null,
        p_telefon: vars.telefon ?? null,
        p_next_action_date: vars.next_action_date ?? null,
        p_next_action_type: vars.next_action_type ?? null,
        p_kontrakt_wartosc: vars.kontrakt_wartosc ?? null,
        p_prowizja_pct: vars.prowizja_pct ?? null,
        p_consent_wdrozenie: vars.consent_wdrozenie,
        p_consent_finansowanie: vars.consent_finansowanie,
        p_consent_tresc: vars.consent_tresc ?? null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

// Edycja dozwolonych pól leada. Status NIE jest tu zmieniany (brak grantu kolumnowego
// + SSOT przez RPC). assigned_to też pomijamy (reassign = osobna ścieżka admina).
// RLS: admin dowolny, handlowiec tylko swój.
export type PartnerLeadEditable = Partial<
  Pick<
    PartnerLead,
    | "firma_nazwa"
    | "nip"
    | "osoba_kontakt"
    | "email"
    | "telefon"
    | "next_action_date"
    | "next_action_type"
    | "kontrakt_wartosc"
    | "prowizja_pct"
  >
>;

export function useUpdatePartnerLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: PartnerLeadEditable }) => {
      const { data, error } = await supabase
        .from("partner_leads")
        // cast: supabase-js zawęża argument update do `never` dla ręcznych typów; quirk
        // izolowany tu, publiczne API (PartnerLeadEditable) pozostaje typowane.
        .update(vars.patch as never)
        .eq("id", vars.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as PartnerLead;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
