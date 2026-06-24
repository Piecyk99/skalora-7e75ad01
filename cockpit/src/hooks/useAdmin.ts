import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callRpc } from "@/lib/rpc";
import type { AppRole } from "@/integrations/supabase/types";

// Lista pracowników + role (panel admina). Tylko admin (RPC pilnuje).
export function useStaff(enabled = true) {
  return useQuery({
    queryKey: ["staff"],
    enabled,
    queryFn: () => callRpc("rpc_list_staff", {}),
  });
}

export function useGrantRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { email: string; role: AppRole }) =>
      callRpc("rpc_grant_role", { p_email: vars.email, p_role: vars.role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useRevokeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { email: string; role: AppRole }) =>
      callRpc("rpc_revoke_role", { p_email: vars.email, p_role: vars.role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useReassignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { leadId: string; assignee: string }) =>
      callRpc("rpc_reassign_lead", { p_lead_id: vars.leadId, p_assignee: vars.assignee }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner_leads"] }),
  });
}

export function useRecordConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { email: string; wdrozenie?: boolean; finansowanie?: boolean }) =>
      callRpc("rpc_record_consent", {
        p_email: vars.email,
        p_wdrozenie: vars.wdrozenie ?? true,
        p_finansowanie: vars.finansowanie ?? false,
      }),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["lead_consents", vars.email] }),
  });
}

// Status zgód dla adresu (karta leada). Admin/handlowiec.
export function useLeadConsents(email: string | null | undefined) {
  return useQuery({
    queryKey: ["lead_consents", email],
    enabled: !!email,
    queryFn: async () => {
      const rows = await callRpc("rpc_lead_consents", { p_email: email! });
      return rows[0] ?? { wdrozenie: false, finansowanie: false };
    },
  });
}
