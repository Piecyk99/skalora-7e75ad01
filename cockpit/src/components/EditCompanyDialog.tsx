import { useState } from "react";
import { toast } from "sonner";
import { useUpdatePartnerLead, type PartnerLeadEditable } from "@/hooks/usePartnerLeads";
import type { PartnerLead } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Edycja pól leada (bez statusu — ten zmienia tylko RPC z pipeline).
export function EditCompanyDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: PartnerLead;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const update = useUpdatePartnerLead();
  const [f, setF] = useState({
    firma_nazwa: lead.firma_nazwa ?? "",
    nip: lead.nip ?? "",
    osoba_kontakt: lead.osoba_kontakt ?? "",
    email: lead.email ?? "",
    telefon: lead.telefon ?? "",
    next_action_date: lead.next_action_date ?? "",
    next_action_type: lead.next_action_type ?? "",
    kontrakt_wartosc: lead.kontrakt_wartosc?.toString() ?? "",
    prowizja_pct: lead.prowizja_pct?.toString() ?? "",
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!f.firma_nazwa.trim()) return toast.error("Nazwa firmy jest wymagana.");
    const patch: PartnerLeadEditable = {
      firma_nazwa: f.firma_nazwa.trim(),
      nip: f.nip || null,
      osoba_kontakt: f.osoba_kontakt || null,
      email: f.email || null,
      telefon: f.telefon || null,
      next_action_date: f.next_action_date || null,
      next_action_type: f.next_action_type || null,
      kontrakt_wartosc: f.kontrakt_wartosc ? Number(f.kontrakt_wartosc) : null,
      prowizja_pct: f.prowizja_pct ? Number(f.prowizja_pct) : null,
    };
    try {
      await update.mutateAsync({ id: lead.id, patch });
      toast.success("Zapisano zmiany.");
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edytuj firmę</DialogTitle>
          <DialogDescription>Status zmienia się w pipeline (przez RPC), nie tutaj.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label>Nazwa firmy *</Label>
            <Input value={f.firma_nazwa} onChange={set("firma_nazwa")} />
          </div>
          <div className="space-y-1">
            <Label>NIP</Label>
            <Input value={f.nip} onChange={set("nip")} />
          </div>
          <div className="space-y-1">
            <Label>Osoba kontaktowa</Label>
            <Input value={f.osoba_kontakt} onChange={set("osoba_kontakt")} />
          </div>
          <div className="space-y-1">
            <Label>E-mail</Label>
            <Input type="email" value={f.email} onChange={set("email")} />
          </div>
          <div className="space-y-1">
            <Label>Telefon</Label>
            <Input value={f.telefon} onChange={set("telefon")} />
          </div>
          <div className="space-y-1">
            <Label>Następna akcja — data</Label>
            <Input type="date" value={f.next_action_date} onChange={set("next_action_date")} />
          </div>
          <div className="space-y-1">
            <Label>Następna akcja — typ</Label>
            <Input value={f.next_action_type} onChange={set("next_action_type")} placeholder="telefon / demo / mail" />
          </div>
          <div className="space-y-1">
            <Label>Wartość kontraktu</Label>
            <Input type="number" value={f.kontrakt_wartosc} onChange={set("kontrakt_wartosc")} />
          </div>
          <div className="space-y-1">
            <Label>Prowizja %</Label>
            <Input type="number" value={f.prowizja_pct} onChange={set("prowizja_pct")} />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={update.isPending} onClick={submit}>
            {update.isPending ? "Zapisywanie…" : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
