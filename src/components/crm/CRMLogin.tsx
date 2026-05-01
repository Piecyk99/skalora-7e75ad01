import { useState } from "react";
import { setToken } from "@/lib/crm-api";

interface Props {
  onLogin: () => void;
}

export default function CRMLogin({ onLogin }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_CRM_API_URL ?? "https://skalora-crm-api.dpsolutionsbusiness.workers.dev"}/api/stats`,
        { headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" } }
      );
      if (res.status === 401) {
        setError("Nieprawidłowe hasło.");
        return;
      }
      setToken(password);
      onLogin();
    } catch {
      setError("Błąd połączenia z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
            SKALORA CRM
          </div>
          <p className="text-gray-400 text-sm mt-2">Panel wewnętrzny</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-[#0A0A10] border border-white/10 rounded-xl p-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-gray-300 mb-1">Hasło dostępu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#030305] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00F0FF] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Logowanie..." : "Zaloguj"}
          </button>
        </form>
      </div>
    </div>
  );
}
