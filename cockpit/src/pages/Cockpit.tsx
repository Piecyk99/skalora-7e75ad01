import { useAuth } from "@/hooks/useAuth";
import { useMyTasksToday } from "@/hooks/usePartnerLeads";
import { useExternalTasks } from "@/hooks/useReadModels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";

export default function Cockpit() {
  const { user, hasPermission } = useAuth();
  const tasks = useMyTasksToday(user?.id);
  const external = useExternalTasks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cockpit</h1>
          <p className="text-sm text-muted-foreground">Twój dzień operacyjny — pozysk firm na wdrożenie CRM.</p>
        </div>
        {hasPermission("partner_leads.create") && <AddCompanyDialog />}
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
