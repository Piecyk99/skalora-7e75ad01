import { useState } from "react";
import { toast } from "sonner";
import { useOutreach } from "@/hooks/useReadModels";
import { useAuth } from "@/hooks/useAuth";
import { useApproveOutreach, useMarkReplied, useRunCopywriter, useSendOutreach, useUpdateOutreach } from "@/hooks/useOutreachActions";
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
  const send = useSendOutreach();
  const reply = useMarkReplied();

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

  const doSend = async (o: OutreachRow) => {
    try {
      const r = await send.mutateAsync({ id: o.id });
      toast.success(r.mode === "dry_run" ? `Tryb dry-run — oznaczono jako wysłane (${r.to}).` : `Wysłano do ${r.to}.`);
    } catch (e) { toast.error((e as Error).message); }
  };

  const doReply = async (o: OutreachRow) => {
    try { await reply.mutateAsync({ id: o.id }); toast.success("Oznaczono jako odpowiedź."); }
    catch (e) { toast.error((e as Error).message); }
  };

  const statusChip = (s: string) =>
    s === "bounced" ? "bg-red-100 text-red-800"
    : s === "replied" ? "bg-green-100 text-green-800"
    : s === "sent" ? "bg-blue-100 text-blue-800"
    : "bg-muted";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Outreach</h1>
          <p className="text-sm text-muted-foreground">
            Drafty maili (agent-copywriter) → akceptacja → wysyłka (Resend) → tracking (otwarcia/kliknięcia, bounce, odpowiedź).
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
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className={`rounded-full px-2 py-0.5 ${statusChip(o.status)}`}>{o.status}</span>
                        <span className="text-muted-foreground">{o.kierunek}</span>
                        {(o.status === "sent" || o.status === "bounced" || o.status === "replied") && (
                          <span className="text-muted-foreground">
                            {o.sent_at ? `wysłany ${new Date(o.sent_at).toLocaleString("pl-PL")}` : "wysłany"}
                            {` · otwarcia: ${o.open_count ?? 0} · kliknięcia: ${o.click_count ?? 0}`}
                          </span>
                        )}
                        {o.last_error && <span className="text-red-600" title={o.last_error}>błąd: {o.last_error.slice(0, 60)}</span>}
                      </div>
                    </div>
                    {canManage && o.status === "draft" && (
                      <div className="flex shrink-0 gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(o)}>Edytuj</Button>
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => doApprove(o)}>Akceptuj</Button>
                      </div>
                    )}
                    {canManage && o.status === "approved" && (
                      <Button size="sm" className="h-7 shrink-0 px-2" disabled={send.isPending} onClick={() => doSend(o)}>
                        Wyślij
                      </Button>
                    )}
                    {canManage && (o.status === "sent" || o.status === "bounced") && (
                      <Button size="sm" variant="outline" className="h-7 shrink-0 px-2" disabled={reply.isPending} onClick={() => doReply(o)}>
                        Oznacz odpowiedź
                      </Button>
                    )}
                    {o.status === "replied" && <span className="shrink-0 text-xs text-green-700">odpowiedział ✓</span>}
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
