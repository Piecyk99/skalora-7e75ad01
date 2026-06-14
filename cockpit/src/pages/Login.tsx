import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { callRpc } from "@/lib/rpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const { session, isStaff, loading, refreshRoles } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    navigate("/");
  };

  const signUp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Konto utworzone. Jeśli włączona jest weryfikacja e-mail, potwierdź adres.");
  };

  const bootstrap = async () => {
    setBusy(true);
    try {
      await callRpc("bootstrap_first_admin", {});
      await refreshRoles();
      toast.success("Nadano rolę admin.");
      navigate("/");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Zalogowany, ale bez roli — pokaż bootstrap pierwszego admina.
  if (session && !loading && !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Brak roli</CardTitle>
            <CardDescription>
              Twoje konto nie ma jeszcze roli. Jeśli to świeży system bez administratora,
              możesz nadać sobie rolę admin (działa tylko gdy nie ma jeszcze żadnego admina).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" disabled={busy} onClick={bootstrap}>
              Zostań pierwszym adminem
            </Button>
            <Button variant="outline" className="w-full" onClick={() => supabase.auth.signOut()}>
              Wyloguj
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Skalora — Cockpit DP DYNEX</CardTitle>
          <CardDescription>Zaloguj się do panelu pozysku.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full" disabled={busy} onClick={signIn}>Zaloguj</Button>
          <Button variant="outline" className="w-full" disabled={busy} onClick={signUp}>
            Utwórz konto
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
