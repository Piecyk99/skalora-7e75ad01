import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, Users, FileText, Bell, Search,
  Star, Zap, Shield, Globe, LayoutDashboard, TrendingUp,
  Mail, Plus, Filter, MoreHorizontal, Settings, Code,
  Database, Check, Layers
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const BAR_DATA = [12, 18, 14, 22, 31, 27, 38];
const BAR_DAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const maxBar = Math.max(...BAR_DATA);

const LEADS_PIPELINE = [
  {
    col: "Nowy", color: "blue",
    leads: [
      { name: "Anna Kowalska", company: "TechPl Sp. z o.o.", value: "12 000 PLN" },
      { name: "Bartek Lewandowski", company: "Budex SA", value: "45 000 PLN" },
    ],
  },
  {
    col: "Kontakt", color: "yellow",
    leads: [
      { name: "Piotr Nowak", company: "OZE Expert", value: "28 000 PLN" },
      { name: "Zofia Kamińska", company: "MediCare", value: "8 500 PLN" },
    ],
  },
  {
    col: "Zakwalif.", color: "purple",
    leads: [
      { name: "Marek Bąk", company: "LogiPro", value: "67 000 PLN" },
    ],
  },
  {
    col: "Oferta", color: "orange",
    leads: [
      { name: "Katarzyna Wójcik", company: "RetailMax", value: "34 000 PLN" },
    ],
  },
  {
    col: "Wygrany", color: "green",
    leads: [
      { name: "Jan Kowalski", company: "StartUP X", value: "22 000 PLN" },
      { name: "Maria Zielińska", company: "HealthTech", value: "55 000 PLN" },
    ],
  },
];

const COL_COLORS: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  orange: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  green: "bg-green-500/20 text-green-300 border-green-500/30",
};

const SAMPLE_CONTACTS = [
  { name: "Anna Kowalska", company: "TechPl", role: "CEO", email: "anna@techpl.pl", phone: "+48 600 100 200", status: "Wygrany" },
  { name: "Piotr Nowak", company: "OZE Expert", role: "Dyrektor", email: "p.nowak@oze.pl", phone: "+48 501 200 300", status: "Oferta" },
  { name: "Magdalena Wiśniewska", company: "MediCare", role: "Manager", email: "m.wisn@medicare.pl", phone: "+48 700 300 400", status: "Kontakt" },
  { name: "Tomasz Zając", company: "LogiPro", role: "CFO", email: "t.zajac@logipro.pl", phone: "+48 510 400 500", status: "Zakwalif." },
  { name: "Katarzyna Wójcik", company: "RetailMax", role: "CMO", email: "k.wojcik@retail.pl", phone: "+48 660 500 600", status: "Oferta" },
];

const STATUS_COLORS: Record<string, string> = {
  "Wygrany": "bg-green-500/20 text-green-300 border-green-500/30",
  "Oferta": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Kontakt": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Zakwalif.": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Nowy": "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const AUTOMATIONS = [
  { active: true,  trigger: "Nowy lead dodany",              action: "Wyślij email powitalny z szablonu",              runs: 247 },
  { active: true,  trigger: "Brak kontaktu przez 3 dni",     action: "Powiadomienie Slack do handlowca",              runs: 89  },
  { active: true,  trigger: "Lead z Facebook Ads",           action: "Przypisz do handlowca + dodaj tag FB",         runs: 134 },
  { active: false, trigger: "Status zmieniony na Wygrany",   action: "Wyślij fakturę + SMS z podziękowaniem",        runs: 0   },
  { active: true,  trigger: "Lead wchodzi w etap Oferta",    action: "Follow-up email po 24h",                      runs: 56  },
];

const INTEGRATION_GROUPS = [
  {
    title: "API & Techniczne",
    icon: Code,
    accent: "#00F0FF",
    items: [
      { name: "REST API",   desc: "Pełna integracja przez HTTP/JSON — własne aplikacje, ERP, bazy danych, wszystko co chcesz podłączyć." },
      { name: "Webhooks",   desc: "Real-time eventy przy każdej akcji w CRM — nowy lead, zmiana statusu, dodana notatka, wygrany deal." },
      { name: "GraphQL",    desc: "Elastyczne zapytania dla zaawansowanych integracji i raportowania danych w czasie rzeczywistym." },
    ],
  },
  {
    title: "Automatyzacje no-code",
    icon: Zap,
    accent: "#F59E0B",
    items: [
      { name: "Zapier",     desc: "Połącz z 6000+ aplikacjami bez pisania kodu — Gmail, Google Sheets, Trello, Notion i tysiące innych." },
      { name: "Make.com",   desc: "Zaawansowane scenariusze z warunkami, pętlami i transformacjami danych bez ograniczeń." },
      { name: "n8n",        desc: "Open-source automation z własnym hostingiem — pełna kontrola nad przepływami bez miesięcznych opłat." },
    ],
  },
  {
    title: "Komunikacja & Email",
    icon: Mail,
    accent: "#A855F7",
    items: [
      { name: "Email SMTP/IMAP",        desc: "Dwukierunkowa synchronizacja skrzynki — cała korespondencja widoczna bezpośrednio w profilu leada." },
      { name: "WhatsApp Business API",  desc: "Wysyłaj i odbieraj wiadomości WhatsApp z poziomu CRM — historia rozmów w jednym miejscu." },
      { name: "SMS via Twilio",         desc: "Automatyczne i ręczne SMS z szablonami, harmonogramem i śledzeniem dostarczenia." },
    ],
  },
  {
    title: "Marketing & Lead Gen",
    icon: TrendingUp,
    accent: "#10B981",
    items: [
      { name: "Facebook Lead Ads",   desc: "Leady z kampanii Meta trafiają do CRM w czasie rzeczywistym z automatycznym przypisaniem do handlowca." },
      { name: "Google Ads / Forms",  desc: "Importuj leady z formularzy Google i śledź ROI każdej kampanii bezpośrednio w dashboardzie CRM." },
      { name: "Formularz embed",     desc: "Wstaw kod na stronę — każde zgłoszenie to automatycznie nowy lead w CRM z pełnym trackowaniem źródła." },
    ],
  },
  {
    title: "Workspace & Notyfikacje",
    icon: Bell,
    accent: "#6366F1",
    items: [
      { name: "Google Workspace",  desc: "Synchronizacja z Gmail, Google Calendar i Drive — spotkania, dokumenty, email zsynchronizowane z CRM." },
      { name: "Slack",             desc: "Powiadomienia o nowych leadach, zmianach statusu i zadaniach bezpośrednio na wybranym kanale Slack." },
      { name: "Microsoft 365",     desc: "Integracja z Outlook, Teams i OneDrive dla firm działających w ekosystemie Microsoft." },
    ],
  },
  {
    title: "Bazy danych & Storage",
    icon: Database,
    accent: "#EF4444",
    items: [
      { name: "PostgreSQL / MySQL",  desc: "Import historycznych danych klientów i synchronizacja dwustronna z własną bazą danych." },
      { name: "Google Sheets",       desc: "Eksportuj raporty i synchronizuj dane z arkuszami — dostępne dla każdego w zespole bez technicznej wiedzy." },
      { name: "S3 / R2 Storage",     desc: "Dokumenty, oferty i pliki klientów przechowywane w chmurze z dostępem z poziomu karty leada." },
    ],
  },
];

const FEATURES = [
  { icon: Users,    title: "Pipeline leadów 360°",             desc: "Od pierwszego kontaktu do zamkniętej sprzedaży — statusy, notatki, historia wszystko w jednym profilu." },
  { icon: BarChart3, title: "Analityka w czasie rzeczywistym", desc: "Konwersja, czas zamknięcia, wartość pipeline, CAC — wszystko na żywo bez eksportu do Excela." },
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
  { name: "Anna Kowalska",       email: "anna@firma.pl",      phone: "+48 600 100 200", stage: "Skaluję biznes",    status: "Wygrany"    },
  { name: "Piotr Nowak",         email: "p.nowak@budex.pl",   phone: "+48 500 200 300", stage: "Rozwijam się",     status: "Oferta"     },
  { name: "Magdalena Wiśniewska",email: "m.wisn@oze.pl",      phone: "+48 700 300 400", stage: "Dopiero zaczynam", status: "Kontakt"    },
  { name: "Tomasz Zając",        email: "t.zajac@uslugi.pl",  phone: "+48 510 400 500", stage: "Skaluję biznes",   status: "Zakwalif." },
];

// ── CRM Preview Screens ───────────────────────────────────────────────────────

function DashboardScreen() {
  return (
    <div className="h-full flex flex-col gap-3 overflow-auto">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Wszystkie leady", value: "247", trend: "+12%",  gradient: "from-[#00F0FF] to-[#8A2BE2]" },
          { label: "Konwersja",       value: "18%",  trend: "+2.3%", gradient: "from-green-400 to-emerald-600" },
          { label: "Wygrane deale",   value: "44",   trend: "+8",    gradient: "from-yellow-400 to-orange-500" },
          { label: "Pipeline value",  value: "1.2M", trend: "+340k", gradient: "from-purple-400 to-pink-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className={`text-xl font-black bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>{s.value}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
            <div className="text-[10px] text-green-400 mt-1">{s.trend} ten miesiąc</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-3 flex-1 min-h-0">
        <div className="col-span-3 bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col">
          <div className="text-[11px] font-medium text-white mb-3">Nowe leady — ostatnie 7 dni</div>
          <div className="flex items-end gap-2 flex-1">
            {BAR_DATA.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full rounded-t-sm min-h-[4px]"
                  style={{
                    height: `${(val / maxBar) * 72}px`,
                    background: i === 6 ? "linear-gradient(to top, #00F0FF, #8A2BE2)" : "rgba(255,255,255,0.1)",
                  }}
                />
                <span className="text-[9px] text-gray-600">{BAR_DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-[11px] font-medium text-white mb-3">Najnowsze leady</div>
          <div className="space-y-2">
            {SAMPLE_CONTACTS.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] text-white truncate">{c.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{c.company}</div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[c.status]}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineScreen() {
  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-3 min-w-[700px] h-full">
        {LEADS_PIPELINE.map((col) => (
          <div key={col.col} className="flex-1 min-w-[130px]">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${COL_COLORS[col.color]}`}>
                {col.col} · {col.leads.length}
              </span>
              <Plus size={11} className="text-gray-600" />
            </div>
            <div className="space-y-2">
              {col.leads.map((lead) => (
                <div key={lead.name} className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:border-white/20 transition-colors">
                  <div className="text-[11px] font-medium text-white leading-tight">{lead.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{lead.company}</div>
                  <div className="text-[10px] text-[#00F0FF] mt-1.5 font-bold">{lead.value}</div>
                </div>
              ))}
              <div className="border border-dashed border-white/10 rounded-lg p-2 text-center cursor-pointer hover:border-white/20 transition-colors">
                <Plus size={11} className="text-gray-700 mx-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactsScreen() {
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
          <Search size={11} className="text-gray-500" />
          <span className="text-[11px] text-gray-500">Szukaj kontaktów...</span>
        </div>
        <button className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 text-[11px] text-gray-400 border border-white/5">
          <Filter size={10} /> Status
        </button>
        <button className="flex items-center gap-1.5 bg-[#00F0FF]/10 rounded-lg px-3 py-1.5 text-[11px] text-[#00F0FF] border border-[#00F0FF]/20">
          <Plus size={10} /> Nowy kontakt
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-gray-500 border-b border-white/5">
              <th className="text-left py-1.5 pr-4 font-medium">Kontakt</th>
              <th className="text-left py-1.5 pr-4 font-medium">Email</th>
              <th className="text-left py-1.5 pr-4 font-medium">Status</th>
              <th className="py-1.5" />
            </tr>
          </thead>
          <tbody>
            {SAMPLE_CONTACTS.map((c) => (
              <tr key={c.name} className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors">
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00F0FF]/30 to-[#8A2BE2]/30 flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-white font-medium">{c.name}</div>
                      <div className="text-gray-500">{c.company} · {c.role}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2 pr-4 text-gray-400">{c.email}</td>
                <td className="py-2 pr-4">
                  <span className={`px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                </td>
                <td className="py-2 text-right">
                  <MoreHorizontal size={13} className="text-gray-600 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  const funnel = [
    { label: "Leady łącznie",      value: 247, pct: 100, color: "from-[#00F0FF] to-[#8A2BE2]" },
    { label: "Nawiązany kontakt",  value: 189, pct: 76,  color: "from-blue-400 to-cyan-500" },
    { label: "Zakwalifikowane",    value: 102, pct: 41,  color: "from-purple-400 to-violet-600" },
    { label: "Oferty wysłane",     value: 58,  pct: 23,  color: "from-orange-400 to-red-500" },
    { label: "Wygrane deale",      value: 44,  pct: 18,  color: "from-green-400 to-emerald-600" },
  ];
  return (
    <div className="h-full grid grid-cols-2 gap-4 overflow-auto">
      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <div className="text-[11px] font-medium text-white mb-4">Lejek sprzedaży</div>
        <div className="space-y-3">
          {funnel.map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-gray-400">{row.label}</span>
                <span className="text-white font-bold">{row.value}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${row.color}`} style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2.5">
        {[
          { label: "Śr. czas zamknięcia",  value: "14 dni",      icon: "⏱" },
          { label: "Śr. wartość deala",    value: "28 500 PLN",  icon: "💰" },
          { label: "Win rate",             value: "18%",         icon: "🎯" },
          { label: "Koszt pozysk. leada",  value: "47 PLN",      icon: "📊" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
            <span className="text-lg">{kpi.icon}</span>
            <div>
              <div className="text-sm font-black text-white">{kpi.value}</div>
              <div className="text-[11px] text-gray-400">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AutomationsScreen() {
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-500">5 aktywnych · 526 uruchomień łącznie</span>
        <button className="flex items-center gap-1.5 bg-[#00F0FF]/10 rounded-lg px-3 py-1.5 text-[11px] text-[#00F0FF] border border-[#00F0FF]/20">
          <Plus size={10} /> Nowa reguła
        </button>
      </div>
      <div className="flex-1 overflow-auto space-y-2">
        {AUTOMATIONS.map((auto, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${
              auto.active ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5 opacity-50"
            }`}
          >
            <div className={`w-8 h-4 rounded-full flex items-center px-0.5 flex-shrink-0 ${
              auto.active ? "bg-[#00F0FF]/40" : "bg-white/10"
            }`}>
              <div className={`w-3 h-3 rounded-full transition-transform ${
                auto.active ? "translate-x-4 bg-[#00F0FF]" : "bg-white/40"
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
                <span className="text-gray-500 font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px]">JEŚLI</span>
                <span className="text-white font-medium">{auto.trigger}</span>
                <span className="text-gray-500 font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px]">TO</span>
                <span className="text-[#00F0FF] font-medium">{auto.action}</span>
              </div>
            </div>
            {auto.active && (
              <span className="text-[10px] text-gray-600 flex-shrink-0">{auto.runs}× uruchom.</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CRM App Preview ──────────────────────────────────────────────────────────

type ScreenId = "dashboard" | "pipeline" | "contacts" | "analytics" | "automations";

const SCREENS = [
  { id: "dashboard"   as ScreenId, label: "Pulpit",         icon: LayoutDashboard },
  { id: "pipeline"    as ScreenId, label: "Pipeline",       icon: BarChart3 },
  { id: "contacts"    as ScreenId, label: "Kontakty",       icon: Users },
  { id: "analytics"  as ScreenId, label: "Analityka",      icon: TrendingUp },
  { id: "automations" as ScreenId, label: "Automatyzacje",  icon: Zap },
];

function CRMAppPreview() {
  const [active, setActive] = useState<ScreenId>("dashboard");
  const screen = SCREENS.find(s => s.id === active)!;
  const ActiveIcon = screen.icon;

  const content: Record<ScreenId, React.ReactNode> = {
    dashboard:   <DashboardScreen />,
    pipeline:    <PipelineScreen />,
    contacts:    <ContactsScreen />,
    analytics:   <AnalyticsScreen />,
    automations: <AutomationsScreen />,
  };

  return (
    <div className="bg-[#0A0A12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
      {/* Browser chrome */}
      <div className="bg-[#060610] border-b border-white/10 px-4 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 bg-white/5 rounded-md px-4 py-1 text-[11px] text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            crm.skalora.pl · SKALORA CRM — Panel zarządzania
          </div>
        </div>
        <div className="w-16" />
      </div>

      {/* App layout */}
      <div className="flex" style={{ height: "480px" }}>
        {/* Sidebar */}
        <div className="w-44 bg-[#050510] border-r border-white/5 flex flex-col py-4 px-2.5 flex-shrink-0">
          <div className="mb-5 px-2">
            <span className="font-black text-sm bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
              SKALORA CRM
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] text-green-400">Online · sync live</span>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5">
            {SCREENS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-[#00F0FF]" : ""} />
                  {s.label}
                  {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-[#00F0FF]" />}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-white/5 pt-3 mt-3">
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5">
              <Settings size={13} /> Ustawienia
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* App topbar */}
          <div className="border-b border-white/5 px-4 py-2.5 flex items-center justify-between bg-[#070712]">
            <div className="flex items-center gap-2">
              <ActiveIcon size={14} className="text-[#00F0FF]" />
              <span className="text-sm font-semibold text-white">{screen.label}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span className="hidden sm:block">Ostatnia sync: przed chwilą</span>
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Live
              </span>
            </div>
          </div>
          {/* Screen content */}
          <div className="flex-1 p-4 overflow-hidden">
            {content[active]}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SkaloraCRMPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030305] text-white">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030305]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-bold text-xl bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
              SKALORA
            </span>
            <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <Link to="/" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-md transition-colors">Agencja</Link>
              <span className="px-3 py-1.5 text-sm text-white bg-white/10 rounded-md font-medium">CRM</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDemoOpen(true)}
              className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
            >
              Zobacz demo
            </button>
            <Link
              to="/#contact"
              className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Zamów wdrożenie
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
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
            <Link
              to="/#contact"
              className="flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full hover:border-white/40 transition-colors text-lg"
            >
              Zamów wdrożenie
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            {["Wdrożenie w 24h", "Własna instancja", "API + Webhooks", "Integracje no-code", "Bez limitu użytkowników"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={13} className="text-[#00F0FF]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive CRM Preview ── */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Interaktywny podgląd systemu — kliknij zakładki w sidebarze aby zobaczyć różne widoki
            </div>
          </div>
          <CRMAppPreview />
          <p className="text-center text-sm text-gray-500 mt-4">
            Podgląd panelu SKALORA CRM —{" "}
            <button onClick={() => setDemoOpen(true)} className="text-[#00F0FF] hover:underline">
              otwórz pełne demo
            </button>
          </p>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 text-purple-300 rounded-full px-4 py-2 mb-4">
              <Layers size={13} />
              Ekosystem integracji
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mb-4">
              Łączy się z wszystkim,{" "}
              <span className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
                czego używasz
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              REST API, Webhooks, Zapier, Make.com, Gmail, WhatsApp, Facebook Ads, Slack i więcej.
              CRM integruje się z Twoim obecnym stackiem narzędzi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATION_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div
                  key={group.title}
                  className="bg-[#0A0A10] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
                >
                  <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${group.accent}20`, border: `1px solid ${group.accent}30` }}
                    >
                      <GroupIcon size={16} style={{ color: group.accent }} />
                    </div>
                    <h3 className="text-sm font-bold text-white">{group.title}</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {group.items.map((item) => (
                      <div key={item.name} className="px-5 py-3.5 hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: group.accent }}
                          />
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

          {/* Custom integration CTA */}
          <div className="mt-10 bg-gradient-to-r from-[#00F0FF]/5 via-[#8A2BE2]/5 to-[#00F0FF]/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-white font-bold text-xl mb-2">Potrzebujesz niestandardowej integracji?</p>
            <p className="text-gray-400 text-sm mb-5 max-w-xl mx-auto">
              Masz własny system ERP, CMS albo aplikację? Wdrożymy dedykowaną integrację przez REST API lub Webhook — bez kompromisów.
            </p>
            <Link
              to="/#contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black text-sm font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Porozmawiajmy o integracji <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-4">
              Wszystko czego potrzebujesz
            </h2>
            <p className="text-gray-400">Jeden system zamiast Excela, notesu i pamięci.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#0A0A10] border border-white/10 rounded-xl p-5 hover:border-[#00F0FF]/30 transition-colors">
                <f.icon size={22} className="text-[#00F0FF] mb-3" />
                <h3 className="text-white font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black tracking-tighter text-white mb-3">Pipeline sprzedaży</h2>
            <p className="text-gray-400">5 statusów — wiesz dokładnie na jakim etapie jest każdy klient.</p>
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

      {/* ── CTA ── */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-4">
            Gotowy żeby przestać gubić klientów?
          </h2>
          <p className="text-gray-400 mb-8">
            Skontaktuj się z nami — wdrożymy CRM pod Twój biznes w ciągu 24 godzin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setDemoOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-bold px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
            >
              Wypróbuj demo <ArrowRight size={18} />
            </button>
            <Link
              to="/#contact"
              className="border border-white/20 text-white px-8 py-4 rounded-full hover:border-white/40 transition-colors"
            >
              Porozmawiajmy
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
            SKALORA CRM
          </span>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">Agencja</Link>
            <button onClick={() => setDemoOpen(true)} className="hover:text-white transition-colors">Demo</button>
            <Link to="/#contact" className="hover:text-white transition-colors">Kontakt</Link>
          </div>
        </div>
      </footer>

      {/* ── Demo Modal ── */}
      {demoOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A10] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <span className="font-bold text-white">Demo — SKALORA CRM</span>
                <p className="text-xs text-gray-400 mt-0.5">Przykładowe dane, możesz swobodnie klikać</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/crm"
                  className="text-sm text-[#00F0FF] hover:underline"
                  onClick={() => setDemoOpen(false)}
                >
                  Otwórz pełne demo →
                </Link>
                <button onClick={() => setDemoOpen(false)} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Wszystkie leady", value: "24", color: "from-[#00F0FF] to-[#8A2BE2]" },
                  { label: "Dzisiaj",         value: "3",  color: "from-green-400 to-emerald-600" },
                  { label: "Wygrane",         value: "8",  color: "from-yellow-400 to-orange-500" },
                ].map((s) => (
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
                  {DEMO_LEADS.map((lead) => (
                    <div key={lead.name} className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div>
                        <div className="text-sm text-white font-medium">{lead.name}</div>
                        <div className="text-xs text-gray-400">{lead.email} · {lead.phone}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 hidden sm:block">{lead.stage}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[lead.status]}`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center pt-2">
                <p className="text-gray-400 text-sm mb-3">Chcesz taki system dla swojej firmy?</p>
                <Link
                  to="/#contact"
                  onClick={() => setDemoOpen(false)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-sm"
                >
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
