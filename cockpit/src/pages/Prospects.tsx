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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prospects</h1>
          <p className="text-sm text-muted-foreground">
            Strefa agenta-prospektora. Oceń ICP i promuj dobre firmy do pipeline'u.
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button disabled={find.isPending} onClick={runFinder}>
              {find.isPending ? "Szukam…" : "Szukaj firm (AI)"}
            </Button>
            <Button variant="outline" disabled={run.isPending} onClick={runAgent}>
              {run.isPending ? "Ocenianie…" : "Uruchom prospektora"}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button>Dodaj prospekt</Button></DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Dodaj prospekt</DialogTitle>
                  <DialogDescription>Status „Nowy" — oceni go agent lub ocenisz ręcznie.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label>Nazwa firmy *</Label>
                    <Input value={f.firma_nazwa} onChange={(e) => setF((p) => ({ ...p, firma_nazwa: e.target.value }))} />
                  </div>
                  <div className="space-y-1"><Label>NIP</Label>
                    <Input value={f.nip} onChange={(e) => setF((p) => ({ ...p, nip: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Zatrudnienie</Label>
                    <Input type="number" value={f.zatrudnienie} onChange={(e) => setF((p) => ({ ...p, zatrudnienie: e.target.value }))} /></div>
                  <div className="col-span-2 space-y-1"><Label>Branża</Label>
                    <Input value={f.branza} onChange={(e) => setF((p) => ({ ...p, branza: e.target.value }))} placeholder="usługi / handel / e-commerce" /></div>
                </div>
                <DialogFooter>
                  <Button disabled={add.isPending} onClick={submitAdd}>{add.isPending ? "Zapisywanie…" : "Dodaj"}</Button>
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
                      <TableCell>{p.status}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted-foreground" title={rationale}>{rationale ?? "—"}</TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {p.status !== "promowany" && (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 px-2"
                                  onClick={() => act(setStatus.mutateAsync({ id: p.id, status: "zakwalifikowany" }), "Zakwalifikowano")}>
                                  Kwalifikuj
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2"
                                  onClick={() => act(setStatus.mutateAsync({ id: p.id, status: "odrzucony" }), "Odrzucono")}>
                                  Odrzuć
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 px-2"
                                  onClick={() => act(promote.mutateAsync({ id: p.id }), "Promowano do pipeline'u")}>
                                  Promuj
                                </Button>
                              </>
                            )}
                            {p.status === "promowany" && <span className="text-xs text-muted-foreground">w pipeline</span>}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
