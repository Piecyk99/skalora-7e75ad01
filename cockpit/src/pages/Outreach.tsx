import { useOutreach } from "@/hooks/useReadModels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Outreach() {
  const outreach = useOutreach();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Outreach</h1>
        <p className="text-sm text-muted-foreground">
          Lista draftów maili (read-only). W tej fazie BEZ wysyłki — brak przycisku „wyślij”.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Drafty</CardTitle>
          <CardDescription>Tworzone przez przyszłego agenta-copywritera (service_role).</CardDescription>
        </CardHeader>
        <CardContent>
          {outreach.isLoading ? (
            <p className="text-sm text-muted-foreground">Ładowanie…</p>
          ) : (outreach.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Brak draftów.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Temat</TableHead>
                  <TableHead>Kierunek</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Utworzono</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outreach.data!.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.temat ?? "(bez tematu)"}</TableCell>
                    <TableCell>{o.kierunek}</TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleDateString("pl-PL")}</TableCell>
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
