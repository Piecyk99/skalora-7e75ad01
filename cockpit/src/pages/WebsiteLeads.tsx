import { toast } from "sonner";
import { useWebsiteLeads, useUpdateWebsiteLead } from "@/hooks/useWebsiteLeads";
import { useAuth } from "@/hooks/useAuth";
import { useStaff } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";

const STATUSES = ["nowy", "kontakt", "kwalifikacja", "wygrany", "odrzucony"] as const;
const STATUS_LABEL: Record<string, string> = {
  nowy: "Nowy", kontakt: "Kontakt", kwalifikacja: "Kwalifikacja", wygrany: "Wygrany", odrzucony: "Odrzucony",
};
const STATUS_CLASS: Record<string, string> = {
  nowy: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  kontakt: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  kwalifikacja: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  wygrany: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  odrzucony: "bg-muted text-muted-foreground border-border",
};

export default function WebsiteLeads() {
  const leads = useWebsiteLeads();
  const upd = useUpdateWebsiteLead();
  const { user, hasPermission } = useAuth();
  const isAdmin = hasPermission("admin.manage_roles");
  const staff = useStaff(isAdmin);
  const nameFor = (id: string | null) =>
    id ? (staff.data?.find((s) => s.id === id)?.full_name || staff.data?.find((s) => s.id === id)?.email || "przypisany") : null;

  const rows = leads.data ?? [];
  const cNew = rows.filter((r) => r.status === "nowy").length;

  const setStatus = async (id: string, status: string) => {
    try { await upd.mutateAsync({ id, patch: { status } }); } catch (e) { toast.error((e as Error).message); }
  };
  const assignMe = async (id: string) => {
    if (!user) return;
    try { await upd.mutateAsync({ id, patch: { assigned_to: user.id } }); toast.success("Przypisano do Ciebie."); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Leady ze strony</h1>
        <p className="text-sm text-muted-foreground">
          Kontakty z formularza na <b>skalora.pl</b> — komplet danych z formularza. {cNew > 0 && <span className="text-blue-400">{cNew} nowych.</span>}
        </p>
      </div>

      {leads.isLoading ? (
        <p className="text-sm text-muted-foreground">Ładowanie…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Brak leadów ze strony. Gdy ktoś wypełni formularz na skalora.pl, pojawi się tutaj.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Osoba</th>
                <th className="px-3 py-2 text-left font-semibold">Kontakt</th>
                <th className="px-3 py-2 text-left font-semibold">Etap firmy</th>
                <th className="px-3 py-2 text-left font-semibold">Bloker wzrostu</th>
                <th className="px-3 py-2 text-left font-semibold">Data</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
                <th className="px-3 py-2 text-left font-semibold">Przypisanie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((l) => (
                <tr key={l.id} className="align-top">
                  <td className="px-3 py-3">
                    <div className="font-semibold">{l.imie || "—"}</div>
                    <div className="text-xs text-muted-foreground">{l.source}</div>
                    {l.wiadomosc && <div className="mt-1 max-w-[260px] text-xs text-muted-foreground">{l.wiadomosc}</div>}
                  </td>
                  <td className="px-3 py-3">
                    <a href={`mailto:${l.email}`} className="text-primary underline">{l.email}</a>
                    {l.telefon && <div className="text-xs text-muted-foreground">{l.telefon}</div>}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{l.company_stage || "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{l.growth_blocker || "—"}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("pl-PL")}</td>
                  <td className="px-3 py-3">
                    <select
                      value={l.status}
                      onChange={(e) => setStatus(l.id, e.target.value)}
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${STATUS_CLASS[l.status] ?? "border-border"}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    {l.assigned_to ? (
                      <span className="text-xs">{l.assigned_to === user?.id ? "Ty" : (nameFor(l.assigned_to) ?? "przypisany")}</span>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => assignMe(l.id)}>
                        Przypisz do mnie
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
