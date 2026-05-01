import { useEffect, useState } from "react";
import { fetchStats, type StatsResponse } from "@/lib/crm-api";

const STATUS_LABELS: Record<string, string> = {
  new: "Nowe",
  contacted: "Kontakt",
  qualified: "Zakwalifikowane",
  proposal: "Oferta",
  won: "Wygrane",
  lost: "Przegrane",
};

const STATUS_COLORS: Record<string, string> = {
  new: "text-blue-400",
  contacted: "text-yellow-400",
  qualified: "text-purple-400",
  proposal: "text-orange-400",
  won: "text-green-400",
  lost: "text-red-400",
};

export default function CRMDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-400 animate-pulse">Ładowanie statystyk...</div>
      </div>
    );
  }

  if (!stats) return null;

  const statusMap = Object.fromEntries(
    stats.by_status.map((s) => [s.status, s.count])
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Przegląd</h2>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Wszystkie leady", value: stats.total, color: "from-[#00F0FF] to-[#8A2BE2]" },
          { label: "Dzisiaj", value: stats.today, color: "from-green-400 to-emerald-600" },
          { label: "Ostatnie 7 dni", value: stats.this_week, color: "from-yellow-400 to-orange-500" },
        ].map((item) => (
          <div key={item.label} className="bg-[#0A0A10] border border-white/10 rounded-xl p-5">
            <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
              {item.value}
            </div>
            <div className="text-gray-400 text-sm mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="bg-[#0A0A10] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Podział wg statusu</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-300">{label}</span>
              <span className={`text-lg font-bold ${STATUS_COLORS[status] ?? "text-white"}`}>
                {statusMap[status] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion rate */}
      {stats.total > 0 && (
        <div className="bg-[#0A0A10] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Konwersja</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] h-2 rounded-full"
                style={{ width: `${Math.min(100, ((statusMap.won ?? 0) / stats.total) * 100)}%` }}
              />
            </div>
            <span className="text-white font-medium text-sm">
              {(((statusMap.won ?? 0) / stats.total) * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {statusMap.won ?? 0} wygranych z {stats.total} leadów
          </p>
        </div>
      )}
    </div>
  );
}
