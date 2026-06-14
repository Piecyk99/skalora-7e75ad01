import { useProspects } from "@/hooks/useReadModels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Prospects() {
  const prospects = useProspects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prospects</h1>
        <p className="text-sm text-muted-foreground">
          Strefa lądowania agenta-prospektora (read-only). Na start pusta — zasili ją przyszły agent AI.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista prospektów</CardTitle>
          <CardDescription>Zapis wyłącznie przez agenta (service_role). Tu tylko podgląd.</CardDescription>
        </CardHeader>
        <CardContent>
          {prospects.isLoading ? (
            <p className="text-sm text-muted-foreground">Ładowanie…</p>
          ) : (prospects.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Brak prospektów (strefa pusta).</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Źródło</TableHead>
                  <TableHead>ICP</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prospects.data!.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.firma_nazwa}</TableCell>
                    <TableCell>{p.nip ?? "—"}</TableCell>
                    <TableCell>{p.zrodlo ?? "—"}</TableCell>
                    <TableCell>{p.icp_score ?? "—"}</TableCell>
                    <TableCell>{p.status}</TableCell>
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
