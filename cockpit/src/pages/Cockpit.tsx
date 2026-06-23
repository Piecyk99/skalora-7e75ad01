import { useAuth } from "@/hooks/useAuth";
import { useMyTasksToday, usePartnerLeads } from "@/hooks/usePartnerLeads";
import { useExternalTasks } from "@/hooks/useReadModels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";

const TERMINAL = new Set(["wygrany", "odrzucony"]);

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

export default function Cockpit() {
  const { user, hasPermission } = useAuth();
  const tasks = useMyTasksToday(user?.id);
  const leads = usePartnerLeads();
  const external = useExternalTasks();

  // KPI liczone z zakresu widocznego wg RLS (admin/viewer = wszystko, handlowiec = swoje).
  const all = leads.data ?? [];
  const active = all.filter((l) => !TERMINAL.has(l.status));
  const won = all.filter((l) => l.status === "wygrany").length;
  const pipelineValue = active.reduce((s, l) => s + (l.kontrakt_wartosc ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cockpit</h1>
          <p className="text-sm text-muted-foreground">Twój dzień operacyjny — pozysk firm na wdrożenie CRM.</p>
        </div>
        {hasPermission("partner_leads.create") && <AddCompanyDialog />}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Zadania na dziś" value={tasks.data?.length ?? 0} />
        <Kpi label="Aktywne leady" value={active.length} hint={`${all.length} łącznie`} />
        <Kpi
          label="Wartość pipeline"
          value={`${pipelineValue.toLocaleString("pl-PL")} zł`}
          hint="Method B (aktywne)"
        />
        <Kpi label="Wygrane" value={won} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moje zadania na dziś</CardTitle>
          <CardDescription>
            Firmy przypisane do Ciebie z terminem następnej akcji na dziś lub zaległym.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.isLoading ? (
            <p className="text-sm text-muted-foreground">Ładowanie…</p>
          ) : (tasks.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Brak zadań na dziś. 🎉</p>
          ) : (
            <ul className="divide-y">
              {tasks.data!.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{t.firma_nazwa}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.next_action_type || "akcja"} · termin {t.next_action_date}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Miejsce zarezerwowane na pull z EkoTechniki (external_tasks). Na razie pusty. */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Zadania z EkoTechniki — wkrótce</CardTitle>
          <CardDescription>
            Sekcja zasili się z tabeli external_tasks (pull read-only z CRM EkoTechniki, dedup po source+external_id).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {external.data && external.data.length > 0
              ? `${external.data.length} zadań w cache.`
              : "Integracja nieaktywna w tej fazie — placeholder."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
