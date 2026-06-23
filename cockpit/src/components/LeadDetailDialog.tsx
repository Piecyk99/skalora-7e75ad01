import { useActivityLog } from "@/hooks/useReadModels";
import type { PartnerLead } from "@/integrations/supabase/types";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EVENT_LABEL: Record<string, string> = {
  created: "Utworzono",
  status_change: "Zmiana statusu",
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
  // RLS: admin widzi wszystkie wpisy, handlowiec swoje (actor_id = on).
  const activity = useActivityLog(open ? lead.id : undefined);

  const row = (label: string, value: React.ReactNode) =>
    value ? (
      <div className="flex justify-between gap-4 py-1 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-right font-medium">{value}</span>
      </div>
    ) : null;

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
          {row("Następna akcja", lead.next_action_date && `${lead.next_action_type || "akcja"} · ${lead.next_action_date}`)}
          {row("Kontrakt", lead.kontrakt_wartosc != null && `${lead.kontrakt_wartosc.toLocaleString("pl-PL")} zł`)}
          {row("Prowizja", lead.prowizja_pct != null && `${lead.prowizja_pct}%`)}
          {row("Źródło", lead.source)}
        </div>

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
