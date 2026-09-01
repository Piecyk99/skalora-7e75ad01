import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import CRMDashboard from "@/components/crm/CRMDashboard";
import LeadsList from "@/components/crm/LeadsList";

type Tab = "dashboard" | "leads";

export default function CRM() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }


  return (
    <div className="min-h-screen bg-[#030305] text-white">
      {/* Sidebar / top nav */}
      <div className="border-b border-white/10 bg-[#0A0A10]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent text-lg">
              SKALORA CRM
            </span>
            <nav className="flex gap-1">
              {([
                { id: "dashboard", label: "Przegląd" },
                { id: "leads", label: "Leady" },
              ] as { id: Tab; label: string }[]).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    tab === id
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Strona
            </a>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 text-sm transition-colors"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {tab === "dashboard" && <CRMDashboard />}
        {tab === "leads" && <LeadsList />}
      </main>
    </div>
  );
}
