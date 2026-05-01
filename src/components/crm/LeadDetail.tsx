import { useEffect, useState } from "react";
import { fetchLead, updateLead, addNote, deleteLead, type LeadDetail as LeadDetailType } from "@/lib/crm-api";
import StatusBadge, { STATUS_OPTIONS } from "./StatusBadge";
import type { LeadStatus } from "@/lib/crm-api";

interface Props {
  leadId: number;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pl-PL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function LeadDetail({ leadId, onClose, onUpdated, onDeleted }: Props) {
  const [data, setData] = useState<LeadDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchLead(leadId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [leadId]);

  async function handleStatusChange(status: LeadStatus) {
    if (!data) return;
    setChangingStatus(true);
    const res = await updateLead(leadId, { status });
    setData({ ...data, lead: res.lead });
    onUpdated();
    setChangingStatus(false);
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim() || !data) return;
    setAddingNote(true);
    const res = await addNote(leadId, noteText.trim());
    setData({ ...data, notes: [res.note, ...data.notes], lead: { ...data.lead, notes_count: data.lead.notes_count + 1 } });
    setNoteText("");
    setAddingNote(false);
  }

  async function handleDelete() {
    await deleteLead(leadId);
    onDeleted();
    onClose();
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="text-gray-400 animate-pulse">Ładowanie...</div>
      </div>
    );
  }

  if (!data) return null;
  const { lead, notes, activities } = data;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[#0A0A10] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">{lead.name}</h2>
            <p className="text-gray-400 text-sm">{lead.email} · {lead.phone}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                disabled={changingStatus}
                className="bg-transparent text-white text-sm w-full focus:outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#0A0A10]">{o.label}</option>
                ))}
              </select>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Źródło</div>
              <div className="text-white text-sm">{lead.source}</div>
            </div>
            {lead.company_stage && (
              <div className="bg-white/5 rounded-lg p-3 col-span-2">
                <div className="text-xs text-gray-500 mb-1">Etap firmy</div>
                <div className="text-white text-sm">{lead.company_stage}</div>
              </div>
            )}
            {lead.growth_blocker && (
              <div className="bg-white/5 rounded-lg p-3 col-span-2">
                <div className="text-xs text-gray-500 mb-1">Główny bloker</div>
                <div className="text-white text-sm">{lead.growth_blocker}</div>
              </div>
            )}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Data dodania</div>
              <div className="text-white text-sm">{formatDate(lead.created_at)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Ostatnia aktywność</div>
              <div className="text-white text-sm">{formatDate(lead.updated_at)}</div>
            </div>
          </div>

          {/* Add note */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Dodaj notatkę</h3>
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Wpisz notatkę..."
                className="flex-1 bg-[#030305] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00F0FF]"
              />
              <button
                type="submit"
                disabled={addingNote || !noteText.trim()}
                className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] px-4 py-2 rounded-lg text-sm hover:bg-[#00F0FF]/20 disabled:opacity-40 transition-colors"
              >
                {addingNote ? "..." : "Dodaj"}
              </button>
            </form>
          </div>

          {/* Notes list */}
          {notes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Notatki ({notes.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white/5 rounded-lg p-3">
                    <p className="text-white text-sm">{note.content}</p>
                    <p className="text-gray-500 text-xs mt-1">{note.author} · {formatDate(note.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity timeline */}
          {activities.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Historia</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#00F0FF]/50 flex-shrink-0" />
                    <span className="flex-1">{act.description}</span>
                    <span className="flex-shrink-0">{formatDate(act.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete */}
          <div className="pt-2 border-t border-white/10">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-400">Na pewno usunąć lead?</span>
                <button onClick={handleDelete} className="text-red-400 text-sm underline">Tak, usuń</button>
                <button onClick={() => setConfirmDelete(false)} className="text-gray-400 text-sm underline">Anuluj</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="text-red-500/60 text-xs hover:text-red-400 transition-colors">
                Usuń lead
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
