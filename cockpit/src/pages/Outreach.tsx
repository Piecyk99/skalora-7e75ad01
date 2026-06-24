import { useState } from "react";
import { toast } from "sonner";
import { useOutreach } from "@/hooks/useReadModels";
import { useAuth } from "@/hooks/useAuth";
import { useApproveOutreach, useRunCopywriter, useUpdateOutreach } from "@/hooks/useOutreachActions";
import type { Outreach as OutreachRow } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function Outreach() {
  const outreach = useOutreach();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("partner_leads.create"); // admin + handlowiec
  const run = useRunCopywriter();
  const approve = useApproveOutreach();
  const update = useUpdateOutreach();

  const [edit, setEdit] = useState<OutreachRow | null>(null);
  const [temat, setTemat] = useState("");
  const [tresc, setTresc] = useState("");

  const openEdit = (o: OutreachRow) => { setEdit(o); setTemat(o.temat ?? ""); setTresc(o.tresc ?? ""); };

  const runAgent = async () => {
    try {
      const r = await run.mutateAsync({ limit: 10 });
      toast.success(`Copywriter (${r.engine}) utworzył ${r.drafted} draftów.`);
    } catch (e) { toast.error((e as Error).message); }
  };

  const saveEdit = async () => {
    if (!edit) return;
    try { await update.mutateAsync({ id: edit.id, temat, tresc }); toast.success("Zapisano draft."); setEdit(null); }
    catch (e) { toast.error((e as Error).message); }
  };

  const doApprove = async (o: OutreachRow) => {
    try { await approve.mutateAsync({ id: o.id }); toast.success("Draft zaakceptowany."); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Outreach</h1>
          <p className="text-sm text-muted-foreground">
            Drafty maili (agent-copywriter). W tej fazie BEZ wysyłki — tylko edycja i akceptacja.
          </p>
        </div>
        {canManage && (
          <Button variant="outline" disabled={run.isPending} onClick={runAgent}>
            {run.isPending ? "Generowanie…" : "Generuj drafty"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drafty</CardTitle>
          <CardDescription>
            „Generuj drafty" tworzy maile dla leadów bez outreachu (status „nowy"/„kontakt"). Wysyłka — kolejna faza.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {outreach.isLoading ? (
            <p className="text-sm text-muted-foreground">Ładowanie…</p>
          ) : (outreach.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Brak draftów. Kliknij „Generuj drafty".</p>
          ) : (
            <ul className="divide-y">
              {outreach.data!.map((o) => (
                <li key={o.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">{o.temat ?? "(bez tematu)"}</div>
                      <div className="mt-1 whitespace-pre-line text-xs text-muted-foreground line-clamp-3">{o.tresc}</div>
                      <div className="mt-1 text-xs">
                        <span className="rounded-full bg-muted px-2 py-0.5">{o.status}</span>
                        <span className="ml-2 text-muted-foreground">{o.kierunek}</span>
                      </div>
                    </div>
                    {canManage && o.status === "draft" && (
                      <div className="flex shrink-0 gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(o)}>Edytuj</Button>
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => doApprove(o)}>Akceptuj</Button>
                      </div>
                    )}
                    {o.status === "approved" && <span className="shrink-0 text-xs text-green-700">zaakceptowany</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edytuj draft</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Temat</Label>
              <Input value={temat} onChange={(e) => setTemat(e.target.value)} /></div>
            <div className="space-y-1"><Label>Treść</Label>
              <textarea
                className="min-h-[180px] w-full rounded-md border bg-background p-2 text-sm"
                value={tresc} onChange={(e) => setTresc(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button disabled={update.isPending} onClick={saveEdit}>{update.isPending ? "Zapisywanie…" : "Zapisz"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
