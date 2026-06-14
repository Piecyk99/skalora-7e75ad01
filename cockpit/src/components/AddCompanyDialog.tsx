import { useState } from "react";
import { toast } from "sonner";
import { useCreatePartnerLead } from "@/hooks/usePartnerLeads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EMPTY = {
  firma_nazwa: "",
  nip: "",
  osoba_kontakt: "",
  email: "",
  telefon: "",
  next_action_date: "",
  next_action_type: "",
  kontrakt_wartosc: "",
  prowizja_pct: "",
};

export function AddCompanyDialog() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ ...EMPTY });
  const [consentWdrozenie, setConsentWdrozenie] = useState(false);
  const [consentFinansowanie, setConsentFinansowanie] = useState(false);
  const create = useCreatePartnerLead();

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!f.firma_nazwa.trim()) return toast.error("Nazwa firmy jest wymagana.");
    if (!consentWdrozenie) return toast.error("Wymagana zgoda RODO na wdrożenie CRM.");
    if (!f.email.trim()) return toast.error("E-mail jest wymagany do zapisania zgody RODO.");
    try {
      await create.mutateAsync({
        firma_nazwa: f.firma_nazwa.trim(),
        nip: f.nip || undefined,
        osoba_kontakt: f.osoba_kontakt || undefined,
        email: f.email || undefined,
        telefon: f.telefon || undefined,
        next_action_date: f.next_action_date || undefined,
        next_action_type: f.next_action_type || undefined,
        kontrakt_wartosc: f.kontrakt_wartosc ? Number(f.kontrakt_wartosc) : null,
        prowizja_pct: f.prowizja_pct ? Number(f.prowizja_pct) : null,
        consent_wdrozenie: consentWdrozenie,
        consent_finansowanie: consentFinansowanie,
      });
      toast.success("Firma dodana do pipeline'u.");
      setF({ ...EMPTY });
      setConsentWdrozenie(false);
      setConsentFinansowanie(false);
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Dodaj firmę</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dodaj firmę (ręcznie)</DialogTitle>
          <DialogDescription>source = reczny. Lead trafia do Ciebie ze statusem „Nowy”.</DialogDescription>
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
            <Label>E-mail *</Label>
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
            <Label>Wartość kontraktu (Method B)</Label>
            <Input type="number" value={f.kontrakt_wartosc} onChange={set("kontrakt_wartosc")} />
          </div>
          <div className="space-y-1">
            <Label>Prowizja %</Label>
            <Input type="number" value={f.prowizja_pct} onChange={set("prowizja_pct")} />
          </div>
        </div>
        <div className="mt-2 space-y-2 rounded-md border p-3">
          <div className="text-sm font-medium">Zgody RODO</div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={consentWdrozenie} onCheckedChange={(v) => setConsentWdrozenie(!!v)} />
            <span>Zgoda na kontakt w sprawie <b>wdrożenia CRM</b> (wymagana).</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={consentFinansowanie} onCheckedChange={(v) => setConsentFinansowanie(!!v)} />
            <span>Zgoda na kontakt w sprawie <b>finansowania</b> (opcjonalna).</span>
          </label>
        </div>
        <DialogFooter>
          <Button disabled={create.isPending} onClick={submit}>
            {create.isPending ? "Zapisywanie…" : "Zapisz firmę"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
