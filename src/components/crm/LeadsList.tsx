import { useEffect, useState, useCallback } from "react";
import { fetchLeads, type Lead } from "@/lib/crm-api";
import StatusBadge, { STATUS_OPTIONS } from "./StatusBadge";
import LeadDetail from "./LeadDetail";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchLeads({ status: statusFilter || undefined, search: search || undefined, page });
      setLeads(res.leads);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <h2 className="text-xl font-semibold text-white flex-1">
          Leady <span className="text-gray-400 text-base font-normal">({total})</span>
        </h2>

        {/* Filters */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Szukaj (imię, email, telefon)"
            className="bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#00F0FF] w-48"
          />
          <button type="submit" className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-white/20">
            Szukaj
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
        >
          <option value="">Wszystkie statusy</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#0A0A10]">{o.label}</option>
          ))}
        </select>

        <button onClick={load} className="text-gray-400 hover:text-[#00F0FF] text-sm transition-colors" title="Odśwież">
          ↻ Odśwież
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0A0A10] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-400 animate-pulse">Ładowanie...</div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <div className="text-gray-500">Brak leadów</div>
            {(search || statusFilter) && (
              <button onClick={() => { setSearch(""); setSearchInput(""); setStatusFilter(""); }} className="text-[#00F0FF] text-sm">
                Wyczyść filtry
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Imię</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Telefon</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Etap firmy</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Data</th>
                  <th className="px-4 py-3 text-left">Notatki</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedId(lead.id)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-300">{lead.email}</td>
                    <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">
                      {lead.company_stage ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {lead.notes_count > 0 ? (
                        <span className="text-[#00F0FF]/70">{lead.notes_count}</span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-gray-400 hover:text-white disabled:opacity-30 px-3 py-1 rounded border border-white/10 text-sm"
          >
            ←
          </button>
          <span className="text-gray-400 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-gray-400 hover:text-white disabled:opacity-30 px-3 py-1 rounded border border-white/10 text-sm"
          >
            →
          </button>
        </div>
      )}

      {/* Lead detail modal */}
      {selectedId !== null && (
        <LeadDetail
          leadId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={load}
          onDeleted={load}
        />
      )}
    </div>
  );
}
