import { useState } from "react";
import { toast } from "sonner";
import { useProspects } from "@/hooks/useReadModels";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddProspect,
  usePromoteProspect,
  useRunFinder,
  useRunProspector,
  useSetProspectStatus,
} from "@/hooks/useProspectActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const statusVariant = (s: string) =>
  s === "promowany" ? "default"
  : s === "zakwalifikowany" ? "secondary"
  : s === "odrzucony" ? "destructive"
  : "outline";

export default function Prospects() {
  const prospects = useProspects();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("partner_leads.create"); // admin + handlowiec
  const add = useAddProspect();
  const setStatus = useSetProspectStatus();
  const promote = usePromoteProspect();
  const run = useRunProspector();
  const find = useRunFinder();

  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ firma_nazwa: "", nip: "", zatrudnienie: "", branza: "" });

  const submitAdd = async () => {
    if (!f.firma_nazwa.trim()) return toast.error("Nazwa firmy wymagana.");
    try {
      await add.mutateAsync({
        firma_nazwa: f.firma_nazwa.trim(),
        nip: f.nip || undefined,
        raw_data: {
          ...(f.zatrudnienie ? { zatrudnienie: Number(f.zatrudnienie) } : {}),
          ...(f.branza ? { branza: f.branza } : {}),
        },
      });
      toast.success("Prospekt dodany.");
      setF({ firma_nazwa: "", nip: "", zatrudnienie: "", branza: "" });
      setOpen(false);
    } catch (e) { toast.error((e as Error).message); }
  };

  const act = async (fn: Promise<unknown>, ok: string) => {
    try { await fn; toast.success(ok); } catch (e) { toast.error((e as Error).message); }
  };

  const runAgent = async () => {
    try {
      const r = await run.mutateAsync({ limit: 20 });
      toast.success(`Prospektor (${r.engine}) ocenił ${r.evaluated} prospektów.`);
    } catch (e) { toast.error((e as Error).message); }
  };

  const runFinder = async () => {
    try {
      const r = await find.mutateAsync({ limit: 10 });
      toast.success(`Szukacz: znalazł ${r.found}, dodał ${r.inserted} nowych prospektów.`);
    } catch (e) { toast.error((e as Error).message); }
  };

  // Akcje na prospekcie — wspólne dla tabeli (desktop) i kart (telefon).
  const Actions = ({ id, status, full }: { id: string; status: string; full?: boolean }) => {
    if (status === "promowany") return <span className="text-xs text-muted-foreground">w pipeline</span>;
    const btn = full ? "h-9 flex-1" : "h-7 px-2";
    return (
      <div className={full ? "flex gap-2" : "flex justify-end gap-1"}>
        <Button size="sm" variant="ghost" className={btn}
          onClick={() => act(setStatus.mutateAsync({ id, status: "zakwalifikowany" }), "Zakwalifikowano")}>
          Kwalifikuj
        </Button>
        <Button size="sm" variant="ghost" className={btn}
          onClick={() => act(setStatus.mutateAsync({ id, status: "odrzucony" }), "Odrzucono")}>
          Odrzuć
        </Button>
        <Button size="sm" variant="outline" className={btn}
          onClick={() => act(promote.mutateAsync({ id }), "Promowano do pipeline'u")}>
          Promuj
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prospects</h1>
          <p className="text-sm text-muted-foreground">
            Strefa agenta-prospektora. Oceń ICP i promuj dobre firmy do pipeline'u.
          </p>
        </div>
        {canManage && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" disabled={find.isPending} onClick={runFinder}>
              {find.isPending ? "Szukam…" : "Szukaj firm (AI)"}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" disabled={run.isPending} onClick={runAgent}>
              {run.isPending ? "Ocenianie…" : "Uruchom prospektora"}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="w-full sm:w-auto">Dodaj prospekt</Button></DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Dodaj prospekt</DialogTitle>
                  <DialogDescription>Status „Nowy" — oceni go agent lub ocenisz ręcznie.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Nazwa firmy *</Label>
                    <Input value={f.firma_nazwa} onChange={(e) => setF((p) => ({ ...p, firma_nazwa: e.target.value }))} />
                  </div>
                  <div className="space-y-1"><Label>NIP</Label>
                    <Input value={f.nip} onChange={(e) => setF((p) => ({ ...p, nip: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Zatrudnienie</Label>
                    <Input type="number" value={f.zatrudnienie} onChange={(e) => setF((p) => ({ ...p, zatrudnienie: e.target.value }))} /></div>
                  <div className="space-y-1 sm:col-span-2"><Label>Branża</Label>
                    <Input value={f.branza} onChange={(e) => setF((p) => ({ ...p, branza: e.target.value }))} placeholder="usługi / handel / e-commerce" /></div>
                </div>
                <DialogFooter>
                  <Button className="w-full sm:w-auto" disabled={add.isPending} onClick={submitAdd}>{add.isPending ? "Zapisywanie…" : "Dodaj"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista prospektów</CardTitle>
          <CardDescription>ICP 0–100. „Uruchom prospektora" ocenia firmy ze statusem „nowy".</CardDescription>
        </CardHeader>
        <CardContent>
          {prospects.isLoading ? (
            <p className="text-sm text-muted-foreground">Ładowanie…</p>
          ) : (prospects.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Brak prospektów. Dodaj firmę lub uruchom agenta.</p>
          ) : (
            <>
              {/* Karty — telefon */}
              <div className="space-y-3 md:hidden">
                {prospects.data!.map((p) => {
                  const rationale = (p.raw_data as Record<string, unknown>)?.icp_rationale as string | undefined;
                  return (
                    <div key={p.id} className="rounded-lg border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium">{p.firma_nazwa}</div>
                          {p.nip && <div className="text-xs text-muted-foreground">NIP {p.nip}</div>}
                        </div>
                        <Badge variant={statusVariant(p.status)} className="shrink-0">{p.status}</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">ICP</span>
                        <span className="font-semibold">{p.icp_score ?? "—"}</span>
                      </div>
                      {rationale && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{rationale}</p>
                      )}
                      {canManage && (
                        <div className="mt-3">
                          <Actions id={p.id} status={p.status} full />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tabela — desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Firma</TableHead>
                      <TableHead>ICP</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uzasadnienie</TableHead>
                      {canManage && <TableHead className="text-right">Akcje</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prospects.data!.map((p) => {
                      const rationale = (p.raw_data as Record<string, unknown>)?.icp_rationale as string | undefined;
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.firma_nazwa}{p.nip ? ` · ${p.nip}` : ""}</TableCell>
                          <TableCell>{p.icp_score ?? "—"}</TableCell>
                          <TableCell><Badge variant={statusVariant(p.status)}>{p.status}</Badge></TableCell>
                          <TableCell className="max-w-xs truncate text-xs text-muted-foreground" title={rationale}>{rationale ?? "—"}</TableCell>
                          {canManage && (
                            <TableCell className="text-right">
                              <Actions id={p.id} status={p.status} />
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
