import { useState } from "react";
import { toast } from "sonner";
import { useAgentRuns, useGrantRole, useRevokeRole, useRunAgent, useStaff } from "@/hooks/useAdmin";
import type { AppRole } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const ROLES: AppRole[] = ["admin", "handlowiec_pozysk", "viewer"];

export default function Admin() {
  const staff = useStaff();
  const grant = useGrantRole();
  const revoke = useRevokeRole();
  const runAgent = useRunAgent();
  const agentRuns = useAgentRuns();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("handlowiec_pozysk");

  const doRunAgent = async (fn: "prospector" | "copywriter") => {
    try {
      await runAgent.mutateAsync({ fn, limit: 25 });
      toast.success(`Uruchomiono agenta „${fn}". Wyniki za chwilę (sprawdź Prospects/Outreach).`);
      setTimeout(() => agentRuns.refetch(), 4000);
    } catch (e) { toast.error((e as Error).message); }
  };

  const doGrant = async () => {
    if (!email.trim()) return toast.error("Podaj e-mail.");
    try { await grant.mutateAsync({ email: email.trim(), role }); toast.success(`Nadano rolę ${role}.`); setEmail(""); }
    catch (e) { toast.error((e as Error).message); }
  };
  const doRevoke = async (em: string, r: AppRole) => {
    try { await revoke.mutateAsync({ email: em, role: r }); toast.success(`Odebrano rolę ${r}.`); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administracja — role</h1>
        <p className="text-sm text-muted-foreground">Nadawaj i odbieraj role pracownikom (RBAC additive).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nadaj rolę</CardTitle>
          <CardDescription>User musi mieć już konto (zarejestrowany e-mail).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input className="w-64" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="osoba@firma.pl" />
            </div>
            <div className="space-y-1">
              <Label>Rola</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button disabled={grant.isPending} onClick={doGrant}>Nadaj</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automatyzacja agentów</CardTitle>
          <CardDescription>
            Cron uruchamia agentów co noc: prospector 02:00 UTC, copywriter 02:20 UTC.
            Możesz też uruchomić ręcznie teraz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={runAgent.isPending} onClick={() => doRunAgent("prospector")}>
              Uruchom prospector
            </Button>
            <Button variant="outline" disabled={runAgent.isPending} onClick={() => doRunAgent("copywriter")}>
              Uruchom copywriter
            </Button>
            <Button variant="ghost" disabled={agentRuns.isFetching} onClick={() => agentRuns.refetch()}>
              Odśwież historię
            </Button>
          </div>
          {agentRuns.isLoading ? (
            <p className="text-sm text-muted-foreground">Ładowanie historii…</p>
          ) : (agentRuns.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Brak zarejestrowanych uruchomień cron jeszcze.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Komunikat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(agentRuns.data ?? []).map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{r.jobname.replace("agent-", "").replace("-nightly", "")}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "succeeded" ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.start_time).toLocaleString("pl-PL")}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground" title={r.return_message ?? ""}>
                      {r.return_message ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pracownicy</CardTitle></CardHeader>
        <CardContent>
          {staff.isLoading ? (
            <p className="text-sm text-muted-foreground">Ładowanie…</p>
          ) : staff.isError ? (
            <p className="text-sm text-red-600">Brak dostępu lub błąd: {(staff.error as Error).message}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Imię i nazwisko</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(staff.data ?? []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell>{u.full_name ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 && <span className="text-xs text-muted-foreground">brak</span>}
                        {u.roles.map((r) => (
                          <button
                            key={r}
                            className="rounded-full bg-muted px-2 py-0.5 text-xs hover:bg-destructive/15"
                            title="Kliknij, aby odebrać"
                            onClick={() => doRevoke(u.email ?? "", r as AppRole)}
                          >
                            {r} ✕
                          </button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
