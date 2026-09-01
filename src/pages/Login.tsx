import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { session, isStaff, loading, refreshRoles, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session && isStaff) navigate("/crm", { replace: true });
  }, [loading, session, isStaff, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate("/crm", { replace: true });
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Nie udało się zalogować przez Google.");
      return;
    }
    if (result.redirected) return;
    setBusy(false);
    navigate("/crm", { replace: true });
  };

  const bootstrap = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("bootstrap_first_admin");
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    await refreshRoles();
    setBusy(false);
    if (data) {
      toast.success("Nadano rolę administratora.");
      navigate("/crm", { replace: true });
    } else {
      toast.error("Administrator już istnieje. Poproś go o nadanie dostępu.");
    }
  };

  const cardClass =
    "w-full max-w-sm rounded-2xl border border-white/10 bg-[#0A0A10] p-6";

  if (session && !loading && !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030305] px-4">
        <div className={cardClass}>
          <h1 className="text-lg font-semibold text-white">Konto bez uprawnień</h1>
          <p className="mt-2 text-sm text-gray-400">
            Jeśli to pierwsze uruchomienie systemu i nie ma jeszcze administratora, możesz nadać
            sobie rolę administratora.
          </p>
          <button
            onClick={bootstrap}
            disabled={busy}
            className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] py-2.5 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Zostań pierwszym administratorem
          </button>
          <button
            onClick={signOut}
            className="mt-2 w-full rounded-lg border border-white/10 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5"
          >
            Wyloguj
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030305] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-2xl font-bold text-transparent">
            SKALORA CRM
          </div>
          <p className="mt-2 text-sm text-gray-400">Panel wewnętrzny</p>
        </div>

        <form onSubmit={signIn} className={cardClass + " space-y-4"}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-gray-300">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#030305] px-4 py-2.5 text-white transition-colors focus:border-[#00F0FF] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-gray-300">
              Hasło
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#030305] px-4 py-2.5 text-white transition-colors focus:border-[#00F0FF] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] py-2.5 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Zaloguj
          </button>

          <div className="relative py-1 text-center text-xs text-gray-500">lub</div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={busy}
            className="w-full rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            Zaloguj przez Google
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Dostęp nadaje administrator. Rejestracja jest wyłączona.
        </p>
      </div>
    </div>
  );
}
