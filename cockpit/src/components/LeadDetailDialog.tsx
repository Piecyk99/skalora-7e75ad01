import { toast } from "sonner";
import { useActivityLog } from "@/hooks/useReadModels";
import { useAuth } from "@/hooks/useAuth";
import {
  useLeadConsents,
  useReassignLead,
  useRecordConsent,
  useStaff,
} from "@/hooks/useAdmin";
import { useEnrichContact } from "@/hooks/useEnrich";
import type { PartnerLead } from "@/integrations/supabase/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EVENT_LABEL: Record<string, string> = {
  created: "Utworzono",
  status_change: "Zmiana statusu",
  reassigned: "Przepisano",
};

export function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: PartnerLead;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { hasPermission } = useAuth();
  const isAdmin = hasPermission("admin.manage_roles");
  const canManageConsent = hasPermission("partner_leads.edit"); // admin + handlowiec

  // RLS: admin widzi wszystkie wpisy, handlowiec swoje (actor_id = on).
  const activity = useActivityLog(open ? lead.id : undefined);
  const staff = useStaff(open && isAdmin);
  const consents = useLeadConsents(open && canManageConsent ? lead.email : undefined);
  const reassign = useReassignLead();
  const recordConsent = useRecordConsent();
  const enrich = useEnrichContact();

  const doEnrich = async () => {
    try {
      const r = await enrich.mutateAsync({ target: "lead", id: lead.id });
      const f = r.results?.[0];
      const found = f ? [f.email, f.telefon, f.www].filter(Boolean).join(" · ") : "";
      if (r.updated && found) toast.success(`Uzupełniono: ${found}. Otwórz firmę ponownie, by zobaczyć.`);
      else toast.info("Nie znaleziono nowych publicznych danych kontaktowych.");
    } catch (e) { toast.error((e as Error).message); }
  };

  const row = (label: string, value: React.ReactNode) =>
    value ? (
      <div className="flex justify-between gap-4 py-1 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-right font-medium">{value}</span>
      </div>
    ) : null;

  const doReassign = async (assignee: string) => {
    if (assignee === (lead.assigned_to ?? "")) return;
    try {
      await reassign.mutateAsync({ leadId: lead.id, assignee });
      toast.success("Lead przepisany.");
    } catch (e) { toast.error((e as Error).message); }
  };

  const doRecordConsent = async (finansowanie: boolean) => {
    if (!lead.email) return toast.error("Lead nie ma adresu e-mail.");
    try {
      await recordConsent.mutateAsync({ email: lead.email, wdrozenie: true, finansowanie });
      toast.success("Zapisano zgodę RODO.");
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {lead.firma_nazwa} <StatusBadge status={lead.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="divide-y rounded-md border px-3">
          {row("NIP", lead.nip)}
          {row("Osoba", lead.osoba_kontakt)}
          {row("E-mail", lead.email)}
          {row("Telefon", lead.telefon)}
          {row("WWW", lead.www && (
            <a href={lead.www.startsWith("http") ? lead.www : `https://${lead.www}`}
              target="_blank" rel="noreferrer" className="text-primary underline">{lead.www}</a>
          ))}
          {row("Następna akcja", lead.next_action_date && `${lead.next_action_type || "akcja"} · ${lead.next_action_date}`)}
          {row("Kontrakt", lead.kontrakt_wartosc != null && `${lead.kontrakt_wartosc.toLocaleString("pl-PL")} zł`)}
          {row("Prowizja", lead.prowizja_pct != null && `${lead.prowizja_pct}%`)}
          {row("Źródło", lead.source)}
        </div>

        {canManageConsent && (
          <Button variant="outline" size="sm" className="w-full" disabled={enrich.isPending} onClick={doEnrich}>
            {enrich.isPending ? "Szukam kontaktu…" : "Znajdź kontakt (AI)"}
          </Button>
        )}

        {isAdmin && (
          <div className="space-y-1">
            <div className="text-sm font-semibold">Przypisanie (admin)</div>
            <Select
              value={lead.assigned_to ?? ""}
              onValueChange={doReassign}
              disabled={reassign.isPending || staff.isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wybierz pracownika…" />
              </SelectTrigger>
              <SelectContent>
                {(staff.data ?? []).map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name || u.email || u.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {canManageConsent && lead.email && (
          <div className="space-y-2 rounded-md border p-3">
            <div className="text-sm font-semibold">Zgody RODO ({lead.email})</div>
            {consents.isLoading ? (
              <p className="text-sm text-muted-foreground">Ładowanie…</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full px-2 py-0.5 ${consents.data?.wdrozenie ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                  Wdrożenie CRM: {consents.data?.wdrozenie ? "tak" : "brak"}
                </span>
                <span className={`rounded-full px-2 py-0.5 ${consents.data?.finansowanie ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                  Finansowanie: {consents.data?.finansowanie ? "tak" : "brak"}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm" variant="outline" className="h-7 px-2"
                disabled={recordConsent.isPending || consents.data?.wdrozenie}
                onClick={() => doRecordConsent(false)}
              >
                Dodaj zgodę: wdrożenie
              </Button>
              <Button
                size="sm" variant="outline" className="h-7 px-2"
                disabled={recordConsent.isPending || consents.data?.finansowanie}
                onClick={() => doRecordConsent(true)}
              >
                Dodaj zgodę: finansowanie
              </Button>
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 text-sm font-semibold">Historia</div>
          {activity.isLoading ? (
            <p className="text-sm text-muted-foreground">Ładowanie…</p>
          ) : (activity.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Brak wpisów (lub brak uprawnień do pełnej historii).</p>
          ) : (
            <ol className="space-y-2">
              {activity.data!.map((a) => (
                <li key={a.id} className="border-l-2 border-muted pl-3 text-sm">
                  <div className="font-medium">
                    {EVENT_LABEL[a.event_type] ?? a.event_type}
                    {a.event_type === "status_change" && a.old_value && a.new_value && (
                      <span className="text-muted-foreground"> · {a.old_value} → {a.new_value}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString("pl-PL")}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
