import type { LeadStatus } from "@/lib/crm-api";

const CONFIG: Record<LeadStatus, { label: string; classes: string }> = {
  new:       { label: "Nowy",       classes: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  contacted: { label: "Kontakt",    classes: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  qualified: { label: "Kwalif.",    classes: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  proposal:  { label: "Oferta",     classes: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  won:       { label: "Wygrany",    classes: "bg-green-500/20 text-green-300 border-green-500/30" },
  lost:      { label: "Przegrany",  classes: "bg-red-500/20 text-red-300 border-red-500/30" },
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.new;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

export const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new",       label: "Nowy" },
  { value: "contacted", label: "Kontakt" },
  { value: "qualified", label: "Zakwalifikowany" },
  { value: "proposal",  label: "Oferta wysłana" },
  { value: "won",       label: "Wygrany" },
  { value: "lost",      label: "Przegrany" },
];
