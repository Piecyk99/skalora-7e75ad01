import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, FileText, Bell,
  Star, Zap, Shield, Globe, TrendingUp,
  Mail, Code, Database, Layers, Check, Users, BarChart3
} from "lucide-react";

// ── Preview data (mirrors real CRM data shapes) ───────────────────────────────

const PREVIEW_STATS = {
  total: 24,
  today: 3,
  this_week: 8,
  by_status: [
    { status: "new",       count: 5 },
    { status: "contacted", count: 7 },
    { status: "qualified", count: 4 },
    { status: "proposal",  count: 3 },
    { status: "won",       count: 4 },
    { status: "lost",      count: 1 },
  ],
};

const STATUS_LABELS: Record<string, string> = {
  new:       "Nowe",
  contacted: "Kontakt",
  qualified: "Zakwalifikowane",
  proposal:  "Oferta",
  won:       "Wygrane",
  lost:      "Przegrane",
};

const STATUS_TEXT: Record<string, string> = {
  new:       "text-blue-400",
  contacted: "text-yellow-400",
  qualified: "text-purple-400",
  proposal:  "text-orange-400",
  won:       "text-green-400",
  lost:      "text-red-400",
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  new:       { label: "Nowy",      cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  contacted: { label: "Kontakt",   cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  qualified: { label: "Kwalif.",   cls: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  proposal:  { label: "Oferta",    cls: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  won:       { label: "Wygrany",   cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  lost:      { label: "Przegrany", cls: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const PREVIEW_LEADS = [
  { id: 1, name: "Anna Kowalska",       email: "anna@firma.pl",      phone: "+48 600 100 200", company_stage: "Skaluję biznes",    status: "won",       created_at: "2024-01-15T10:00:00Z", notes_count: 3 },
  { id: 2, name: "Piotr Nowak",         email: "p.nowak@budex.pl",   phone: "+48 500 200 300", company_stage: "Rozwijam się",      status: "proposal",  created_at: "2024-01-18T14:30:00Z", notes_count: 1 },
  { id: 3, name: "Magdalena Wiśniewska", email: "m.wisn@oze.pl",   phone: "+48 700 300 400", company_stage: "Dopiero zaczynam",  status: "contacted", created_at: "2024-01-20T09:15:00Z", notes_count: 0 },
  { id: 4, name: "Tomasz Zając",       email: "t.zajac@uslugi.pl",  phone: "+48 510 400 500", company_stage: "Skaluję biznes",   status: "qualified", created_at: "2024-01-21T11:45:00Z", notes_count: 2 },
  { id: 5, name: "Katarzyna Wójcik",    email: "k.wojcik@retail.pl", phone: "+48 660 500 600", company_stage: "Rozwijam się",     status: "new",       created_at: "2024-01-22T08:00:00Z", notes_count: 0 },
];

const PREVIEW_DETAIL = {
  lead: {
    name: "Anna Kowalska",
    email: "anna@firma.pl",
    phone: "+48 600 100 200",
    status: "won",
    source: "Formularz kontaktowy",
    company_stage: "Skaluję biznes",
    growth_blocker: "Brak systemu pozyskiwania klientów",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-22T15:30:00Z",
    notes_count: 2,
  },
  notes: [
    { id: 1, content: "Bardzo zainteresowana pakietem Full System, chce wdrożenie w ciągu tygodnia.", author: "admin", created_at: "2024-01-20T11:00:00Z" },
    { id: 2, content: "Umówione spotkanie na 22.01 godz. 15:00.",                                       author: "admin", created_at: "2024-01-18T14:30:00Z" },
  ],
  activities: [
    { id: 1, description: "Status zmieniony na: Wygrany",   created_at: "2024-01-22T15:30:00Z" },
    { id: 2, description: "Dodano notatkę",                created_at: "2024-01-20T11:00:00Z" },
    { id: 3, description: "Lead dodany do systemu",          created_at: "2024-01-15T10:00:00Z" },
  ],
};

// ── Sub-views (mirrors real CRM components) ───────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtFull(iso: string) {
  return new Date(iso).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function DashboardView() {
  const statusMap = Object.fromEntries(PREVIEW_STATS.by_status.map(s => [s.status, s.count]));
  const wonPct = ((statusMap.won ?? 0) / PREVIEW_STATS.total) * 100;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Przeıgląd</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Wszystkie leady", value: PREVIEW_STATS.total,     color: "from-[#00F0FF] to-[#8A2BE2]" },
          { label: "Dzisiaj",         value: PREVIEW_STATS.today,     color: "from-green-400 to-emerald-600" },
          { label: "Ostatnie 7 dni",  value: PREVIEW_STATS.this_week, color: "from-yellow-400 to-orange-500" },
        ].map(item => (
          <div key={item.label} className="bg-[#0A0A10] border border-white/10 rounded-xl p-5">
            <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.value}</div>
            <div className="text-gray-400 text-sm mt-1">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0A0A10] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Podział wg statusu</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-300">{label}</span>
              <span className={`text-lg font-bold ${STATUS_TEXT[status]}`}>{statusMap[status] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#0A0A10] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Konwersja</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] h-2 rounded-full"
              style={{ width: `${Math.min(100, wonPct)}%` }}
            />
          </div>
          <span className="text-white font-medium text-sm">{wonPct.toFixed(1)}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {statusMap.won ?? 0} wygranych z {PREVIEW_STATS.total} leadów
        </p>
      </div>
    </div>
  );
}

function LeadsView({ onSelect }: { onSelect: (id: number) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <h2 className="text-xl font-semibold text-white flex-1">
          Leady <span className="text-gray-400 text-base font-normal">({PREVIEW_LEADS.length})</span>
        </h2>
        <div className="flex gap-2">
          <input
            disabled
            placeholder="Szukaj (imię, email, telefon)"
            className="bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm w-48 opacity-50 cursor-not-allowed"
          />
          <button disabled className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm opacity-50 cursor-not-allowed">Szukaj</button>
        </div>
        <select disabled className="bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm opacity-50 cursor-not-allowed">
          <option>Wszystkie statusy</option>
        </select>
        <span className="text-gray-600 text-sm">{"↻"} Odśwież</span>
      </div>
      <div className="bg-[#0A0A10] border border-white/10 rounded-xl overflow-hidden">
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
              {PREVIEW_LEADS.map(lead => {
                const badge = STATUS_BADGE[lead.status];
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelect(lead.id)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-300">{lead.email}</td>
                    <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">{lead.company_stage}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{fmt(lead.created_at)}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {lead.notes_count > 0 ? <span className="text-[#00F0FF]/70">{lead.notes_count}</span> : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeadDetailModal({ onClose }: { onClose: () => void }) {
  const { lead, notes, activities } = PREVIEW_DETAIL;
  const badge = STATUS_BADGE[lead.status];
  return (
    <div className="absolute inset-0 bg-black/70 flex items-end sm:items-center justify-center z-20 p-4">
      <div className="bg-[#0A0A10] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90%] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">{lead.name}</h2>
            <p className="text-gray-400 text-sm">{lead.email} · {lead.phone}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none ml-4">×</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-2">Status</div>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${badge.cls}`}>{badge.label}</span>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Źródło</div>
              <div className="text-white text-sm">{lead.source}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 col-span-2">
              <div className="text-xs text-gray-500 mb-1">Etap firmy</div>
              <div className="text-white text-sm">{lead.company_stage}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 col-span-2">
              <div className="text-xs text-gray-500 mb-1">Główny bloker</div>
              <div className="text-white text-sm">{lead.growth_blocker}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Data dodania</div>
              <div className="text-white text-sm">{fmtFull(lead.created_at)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Ostatnia aktywność</div>
              <div className="text-white text-sm">{fmtFull(lead.updated_at)}</div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Dodaj notatkę</h3>
            <div className="flex gap-2">
              <input
                disabled
                placeholder="Wpisz notatkę..."
                className="flex-1 bg-[#030305] border border-white/10 rounded-lg px-3 py-2 text-white text-sm opacity-50 cursor-not-allowed"
              />
              <button disabled className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] px-4 py-2 rounded-lg text-sm opacity-50 cursor-not-allowed">
                Dodaj
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Notatki ({notes.length})</h3>
            <div className="space-y-2">
              {notes.map(note => (
                <div key={note.id} className="bg-white/5 rounded-lg p-3">
                  <p className="text-white text-sm">{note.content}</p>
                  <p className="text-gray-500 text-xs mt-1">{note.author} · {fmtFull(note.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Historia</h3>
            <div className="space-y-1">
              {activities.map(act => (
                <div key={act.id} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#00F0FF]/50 flex-shrink-0" />
                  <span className="flex-1">{act.description}</span>
                  <span className="flex-shrink-0">{fmtFull(act.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Real CRM Preview (mirrors /crm exactly) ───────────────────────────────────

function CRMPreview() {
  const [tab, setTab] = useState<"dashboard" | "leads">("dashboard");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  function handleSelectLead(id: number) {
    // Only show detail for first lead (Anna) — others just switch to leads tab
    setSelectedId(id === 1 ? 1 : null);
    if (id !== 1) setTab("leads");
  }

  return (
    <div className="relative bg-[#030305] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      {/* Browser chrome */}
      <div className="bg-[#060610] border-b border-white/10 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 bg-white/5 rounded-md px-4 py-1 text-[11px] text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            skalora.pl/crm · SKALORA CRM
          </div>
        </div>
        <div className="w-16" />
      </div>

      {/* Real CRM top nav — matches CRM.tsx exactly */}
      <div className="border-b border-white/10 bg-[#0A0A10]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent text-lg">
              SKALORA CRM
            </span>
            <nav className="flex gap-1">
              {([{ id: "dashboard", label: "Przeıgląd" }, { id: "leads", label: "Leady" }] as const).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => { setTab(id); setSelectedId(null); }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    tab === id ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>← Strona</span>
            <span>Wyloguj</span>
          </div>
        </div>
      </div>

      {/* CRM content — matches max-w-6xl mx-auto px-4 sm:px-6 py-8 from CRM.tsx */}
      <div className="overflow-y-auto" style={{ maxHeight: "520px" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {tab === "dashboard" && <DashboardView />}
          {tab === "leads" && <LeadsView onSelect={handleSelectLead} />}
        </div>
      </div>

      {/* Lead detail modal — matches LeadDetail.tsx */}
      {selectedId !== null && <LeadDetailModal onClose={() => setSelectedId(null)} />}

      {/* Hint overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <div className="h-8 bg-gradient-to-t from-[#030305] to-transparent" />
      </div>
    </div>
  );
}

// ── Integrations & features data ──────────────────────────────────────────────

const INTEGRATION_GROUPS = [
  {
    title: "API & Techniczne",
    icon: Code,
    accent: "#00F0FF",
    items: [
      { name: "REST API",  desc: "Pełna integracja przez HTTP/JSON — własne aplikacje, ERP, bazy danych, wszystko co chcesz podłączyć." },
      { name: "Webhooks",  desc: "Real-time eventy przy każdej akcji w CRM — nowy lead, zmiana statusu, dodana notatka, wygrany deal." },
      { name: "GraphQL",   desc: "Elastyczne zapytania dla zaawansowanych integracji i raportowania danych w czasie rzeczywistym." },
    ],
  },
  {
    title: "Automatyzacje no-code",
    icon: Zap,
    accent: "#F59E0B",
    items: [
      { name: "Zapier",    desc: "Połącz z 6000+ aplikacjami bez pisania kodu — Gmail, Google Sheets, Trello, Notion i tysiące innych." },
      { name: "Make.com",  desc: "Zaawansowane scenariusze z warunkami, pętlami i transformacjami danych bez ograniczeń." },
      { name: "n8n",       desc: "Open-source automation z własnym hostingiem — pełna kontrola nad przepływami bez miesięcznych opłat." },
    ],
  },
  {
    title: "Komunikacja & Email",
    icon: Mail,
    accent: "#A855F7",
    items: [
      { name: "Email SMTP/IMAP",       desc: "Dwukierunkowa synchronizacja skrzynki — cała korespondencja widoczna bezpośrednio w profilu leada." },
      { name: "WhatsApp Business API", desc: "Wysyłaj i odbieraj wiadomości WhatsApp z poziomu CRM — historia rozmów w jednym miejscu." },
      { name: "SMS via Twilio",        desc: "Automatyczne i ręczne SMS z szablonami, harmonogramem i śledzeniem dostarczenia." },
    ],
  },
  {
    title: "Marketing & Lead Gen",
    icon: TrendingUp,
    accent: "#10B981",
    items: [
      { name: "Facebook Lead Ads",  desc: "Leady z kampanii Meta trafiają do CRM w czasie rzeczywistym z automatycznym przypisaniem do handlowca." },
      { name: "Google Ads / Forms", desc: "Importuj leady z formularzy Google i śledź ROI każdej kampanii bezpośrednio w dashboardzie CRM." },
      { name: "Formularz embed",    desc: "Wstaw kod na stronę — każde zgłoszenie to automatycznie nowy lead w CRM z pełnym trackowaniem źródła." },
    ],
  },
  {
    title: "Workspace & Notyfikacje",
    icon: Bell,
    accent: "#6366F1",
    items: [
      { name: "Google Workspace", desc: "Synchronizacja z Gmail, Google Calendar i Drive — spotkania, dokumenty, email zsynchronizowane z CRM." },
      { name: "Slack",            desc: "Powiadomienia o nowych leadach, zmianach statusu i zadaniach bezpośrednio na wybranym kanale Slack." },
      { name: "Microsoft 365",    desc: "Integracja z Outlook, Teams i OneDrive dla firm działających w ekosystemie Microsoft." },
    ],
  },
  {
    title: "Bazy danych & Storage",
    icon: Database,
    accent: "#EF4444",
    items: [
      { name: "PostgreSQL / MySQL", desc: "Import historycznych danych klientów i synchronizacja dwustronna z własną bazą danych." },
      { name: "Google Sheets",      desc: "Eksportuj raporty i synchronizuj dane z arkuszami — dostępne dla każdego w zespole." },
      { name: "S3 / R2 Storage",    desc: "Dokumenty, oferty i pliki klientów przechowywane w chmurze z dostępem z poziomu karty leada." },
    ],
  },
];

const FEATURES = [
  { icon: Users,    title: "Pipeline leadów 360°",             desc: "Od pierwszego kontaktu do zamkniętej sprzedaży — statusy, notatki, historia wszystko w jednym profilu." },
  { icon: BarChart3, title: "Analityka w czasie rzeczywistym", desc: "Konwersja, podział wg statusu, leady dziś i w tygodniu — wszystko na żywo na dashboardzie." },
  { icon: FileText, title: "Historia kontaktów",              desc: "Każda rozmowa, email, notatka — chronologicznie. Wróć po tygodniu i wiesz dokładnie co ustaliliście." },
  { icon: Zap,      title: "Automatyzacje sprzedaży",         desc: "Reguły i triggery — follow-up, powiadomienia, przypisanie leada, SMS — wszystko automatycznie." },
  { icon: Shield,   title: "Własna instancja",                desc: "Twoje dane na Twoim serwerze. Zero ograniczeń od liczby użytkowników. Zero abonamentu od siedzenia." },
  { icon: Globe,    title: "Multi-team & Role",               desc: "Handlowcy, managerowie, admini — każda rola widzi i może to, co powinna. Pełny audyt działań." },
];

const STATUSES = [
  { label: "Nowy",            color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { label: "Kontakt",         color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { label: "Zakwalifikowany", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { label: "Oferta",          color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { label: "Wygrany",         color: "bg-green-500/20 text-green-300 border-green-500/30" },
];

const DEMO_LEADS = [
  { name: "Anna Kowalska",       email: "anna@firma.pl",      phone: "+48 600 100 200", stage: "Skaluję biznes",   status: "won"       },
  { name: "Piotr Nowak",         email: "p.nowak@budex.pl",   phone: "+48 500 200 300", stage: "Rozwijam się",    status: "proposal"  },
  { name: "Magdalena Wiśniewska", email: "m.wisn@oze.pl",   phone: "+48 700 300 400", stage: "Dopiero zaczynam", status: "contacted" },
  { name: "Tomasz Zając",       email: "t.zajac@uslugi.pl",  phone: "+48 510 400 500", stage: "Skaluję biznes",  status: "qualified" },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SkaloraCRMPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030305] text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030305]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-bold text-xl bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">SKALORA</span>
            <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <Link to="/" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-md transition-colors">Agencja</Link>
              <span className="px-3 py-1.5 text-sm text-white bg-white/10 rounded-md font-medium">CRM</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDemoOpen(true)} className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block">
              Zobacz demo
            </button>
            <Link to="/#contact" className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Zamów wdrożenie
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-full px-4 py-1.5 text-sm text-[#00F0FF] mb-6">
            <Star size={13} />
            SaaS CRM — własna instancja, zero abonamentów od użytkowników
          </div>
          <h1 className="font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter mb-6 leading-tight">
            CRM, który{" "}
            <span className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
              skaluje sprzedaż
            </span>
            {" "}z Twoim biznesem
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Pipeline leadów, historia kontaktów, analityka w czasie rzeczywistym,
            automatyzacje i integracje z ponad 20 narzędziami —
            wszystko w jednym systemie na Twoim serwerze.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button
              onClick={() => setDemoOpen(true)}
              className="group flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-bold px-8 py-4 rounded-full hover:opacity-90 transition-all hover:scale-105 text-lg"
            >
              Wypróbuj demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/#contact" className="flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full hover:border-white/40 transition-colors text-lg">
              Zamów wdrożenie
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            {["Wdrożenie w 24h", "Własna instancja", "API + Webhooks", "Integracje no-code", "Bez limitu użytkowników"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={13} className="text-[#00F0FF]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CRM Preview — exact replica of /crm */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Interaktywny podgląd systemu — kliknij zakładki i wiersze w tabeli
            </div>
          </div>
          <CRMPreview />
          <p className="text-center text-sm text-gray-500 mt-4">
            Podgląd panelu SKALORA CRM —{" "}
            <Link to="/crm" className="text-[#00F0FF] hover:underline">
              otwórz pełny panel →
            </Link>
          </p>
        </div>
      </section>

      {/* Integrations */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 text-purple-300 rounded-full px-4 py-2 mb-4">
              <Layers size={13} /> Ekosystem integracji
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mb-4">
              Łączy się z wszystkim,{" "}
              <span className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">czego używasz</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              REST API, Webhooks, Zapier, Make.com, Gmail, WhatsApp, Facebook Ads, Slack i więcej.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATION_GROUPS.map(group => {
              const GroupIcon = group.icon;
              return (
                <div key={group.title} className="bg-[#0A0A10] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
                  <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${group.accent}20`, border: `1px solid ${group.accent}30` }}>
                      <GroupIcon size={16} style={{ color: group.accent }} />
                    </div>
                    <h3 className="text-sm font-bold text-white">{group.title}</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {group.items.map(item => (
                      <div key={item.name} className="px-5 py-3.5 hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: group.accent }} />
                          <div>
                            <div className="text-sm font-semibold text-white">{item.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-10 bg-gradient-to-r from-[#00F0FF]/5 via-[#8A2BE2]/5 to-[#00F0FF]/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-white font-bold text-xl mb-2">Potrzebujesz niestandardowej integracji?</p>
            <p className="text-gray-400 text-sm mb-5 max-w-xl mx-auto">
              Masz własny system ERP, CMS albo aplikację? Wdrożymy dedykowaną integrację przez REST API lub Webhook.
            </p>
            <Link to="/#contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black text-sm font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
              Porozmawiajmy o integracji <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-4">Wszystko czego potrzebujesz</h2>
            <p className="text-gray-400">Jeden system zamiast Excela, notesu i pamięci.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-[#0A0A10] border border-white/10 rounded-xl p-5 hover:border-[#00F0FF]/30 transition-colors">
                <f.icon size={22} className="text-[#00F0FF] mb-3" />
                <h3 className="text-white font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black tracking-tighter text-white mb-3">Pipeline sprzedaży</h2>
            <p className="text-gray-400">6 statusów — wiesz dokładnie na jakim etapie jest każdy klient.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {STATUSES.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-full border text-sm font-medium ${s.color}`}>{s.label}</span>
                {i < STATUSES.length - 1 && <ArrowRight size={16} className="text-gray-600" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-4">Gotowy żeby przestać gubić klientów?</h2>
          <p className="text-gray-400 mb-8">Skontaktuj się z nami — wdrożymy CRM pod Twój biznes w ciągu 24 godzin.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setDemoOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-bold px-8 py-4 rounded-full hover:opacity-90 transition-opacity">
              Wypróbuj demo <ArrowRight size={18} />
            </button>
            <Link to="/#contact" className="border border-white/20 text-white px-8 py-4 rounded-full hover:border-white/40 transition-colors">Porozmawiajmy</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">SKALORA CRM</span>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">Agencja</Link>
            <button onClick={() => setDemoOpen(true)} className="hover:text-white transition-colors">Demo</button>
            <Link to="/#contact" className="hover:text-white transition-colors">Kontakt</Link>
          </div>
        </div>
      </footer>

      {/* Demo modal */}
      {demoOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A10] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <span className="font-bold text-white">Demo — SKALORA CRM</span>
                <p className="text-xs text-gray-400 mt-0.5">Przykładowe dane, możesz swobodnie klikać</p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/crm" className="text-sm text-[#00F0FF] hover:underline" onClick={() => setDemoOpen(false)}>Otwórz pełny panel →</Link>
                <button onClick={() => setDemoOpen(false)} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Wszystkie leady", value: "24", color: "from-[#00F0FF] to-[#8A2BE2]" },
                  { label: "Dzisiaj",         value: "3",  color: "from-green-400 to-emerald-600" },
                  { label: "Wygrane",         value: "4",  color: "from-yellow-400 to-orange-500" },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center">
                    <div className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <span className="text-sm font-medium text-white">Leady (24)</span>
                </div>
                <div className="divide-y divide-white/5">
                  {DEMO_LEADS.map(lead => {
                    const badge = STATUS_BADGE[lead.status];
                    return (
                      <div key={lead.name} className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div>
                          <div className="text-sm text-white font-medium">{lead.name}</div>
                          <div className="text-xs text-gray-400">{lead.email} · {lead.phone}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 hidden sm:block">{lead.stage}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.cls}`}>{badge.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-center pt-2">
                <p className="text-gray-400 text-sm mb-3">Chcesz taki system dla swojej firmy?</p>
                <Link to="/#contact" onClick={() => setDemoOpen(false)} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-sm">
                  Zamów wdrożenie <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
