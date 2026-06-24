import { useState } from "react";
import { toast } from "sonner";
import { usePartnerLeads, usePartnerLifecycle, useDeletePartnerLead } from "@/hooks/usePartnerLeads";
import { useAuth } from "@/hooks/useAuth";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";
import { EditCompanyDialog } from "@/components/EditCompanyDialog";
import { LeadDetailDialog } from "@/components/LeadDetailDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PARTNER_STATUS_LABEL,
  PARTNER_STATUS_ORDER,
  allowedNextStatuses,
} from "@/lib/partnerStatus";
import type { PartnerLead, PartnerStatus } from "@/integrations/supabase/types";

export default function Pipeline() {
  const leads = usePartnerLeads();
  const lifecycle = usePartnerLifecycle();
  const del = useDeletePartnerLead();
  const { hasPermission, hasRole, user } = useAuth();
  const canTransition = hasPermission("partner_leads.transition");
  const canEdit = hasPermission("partner_leads.edit");
  // Usuwa: admin (dowolną) lub handlowiec (tylko swoją). Egzekucja również w RPC.
  const canDelete = (lead: PartnerLead) =>
    hasRole("admin") || (hasRole("handlowiec_pozysk") && lead.assigned_to === user?.id);

  const [detail, setDetail] = useState<PartnerLead | null>(null);
  const [edit, setEdit] = useState<PartnerLead | null>(null);
  const [delTarget, setDelTarget] = useState<PartnerLead | null>(null);

  const move = async (lead: PartnerLead, to: PartnerStatus) => {
    try {
      await lifecycle.mutateAsync({ leadId: lead.id, newStatus: to });
      toast.success(`„${lead.firma_nazwa}” → ${PARTNER_STATUS_LABEL[to]}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    try {
      await del.mutateAsync({ id: delTarget.id });
      toast.success(`Usunięto „${delTarget.firma_nazwa}".`);
      setDelTarget(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const byStatus = (s: PartnerStatus) => (leads.data ?? []).filter((l) => l.status === s);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pipeline pozysku</h1>
          <p className="text-sm text-muted-foreground">
            Zmiana statusu przechodzi wyłącznie przez rpc_partner_lifecycle (SSOT).
          </p>
        </div>
        {hasPermission("partner_leads.create") && <AddCompanyDialog />}
      </div>

      {leads.isLoading ? (
        <p className="text-sm text-muted-foreground">Ładowanie…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PARTNER_STATUS_ORDER.map((status) => {
            const items = byStatus(status);
            return (
              <Card key={status} className="bg-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <StatusBadge status={status} />
                    <span className="text-muted-foreground">{items.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((lead) => {
                    const next = allowedNextStatuses(lead.status);
                    return (
                      <div key={lead.id} className="rounded-md border bg-card p-3 text-sm shadow-sm">
                        <button
                          className="text-left font-medium hover:underline"
                          onClick={() => setDetail(lead)}
                        >
                          {lead.firma_nazwa}
                        </button>
                        {lead.osoba_kontakt && (
                          <div className="text-xs text-muted-foreground">{lead.osoba_kontakt}</div>
                        )}
                        {lead.kontrakt_wartosc != null && (
                          <div className="mt-1 text-xs">
                            Kontrakt: {lead.kontrakt_wartosc.toLocaleString("pl-PL")} zł
                            {lead.prowizja_pct != null && ` · ${lead.prowizja_pct}%`}
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setDetail(lead)}>
                            Szczegóły
                          </Button>
                          {canEdit && (
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEdit(lead)}>
                              Edytuj
                            </Button>
                          )}
                          {canDelete(lead) && (
                            <Button size="sm" variant="ghost"
                              className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDelTarget(lead)}>
                              Usuń
                            </Button>
                          )}
                        </div>
                        {canTransition && next.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {next.map((to) => (
                              <Button
                                key={to}
                                size="sm"
                                variant="outline"
                                disabled={lifecycle.isPending}
                                onClick={() => move(lead, to)}
                              >
                                → {PARTNER_STATUS_LABEL[to]}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {items.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {detail && (
        <LeadDetailDialog lead={detail} open={!!detail} onOpenChange={(v) => !v && setDetail(null)} />
      )}
      {edit && (
        <EditCompanyDialog lead={edit} open={!!edit} onOpenChange={(v) => !v && setEdit(null)} />
      )}

      <ConfirmDeleteDialog
        open={!!delTarget}
        onOpenChange={(v) => !v && setDelTarget(null)}
        description={`Usunięcie firmy „${delTarget?.firma_nazwa ?? ""}" z pipeline jest nieodwracalne. Powiązane drafty zostaną usunięte, a źródłowy prospekt wróci na listę.`}
        pending={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
