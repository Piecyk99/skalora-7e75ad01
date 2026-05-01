import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, FileText, Bell,
  Star, Zap, Shield, Globe, TrendingUp,
  Mail, Code, Database, Layers, Check, Users, BarChart3,
  LayoutDashboard, ListChecks, CheckSquare, CalendarDays, Banknote,
  HardHat, Target, Settings, LogOut, Home, Plus, Landmark,
  AlertTriangle, Clock, Phone, Flame, ChevronRight, Filter,
  Brain, Building2, Wrench, PieChart,
} from "lucide-react";

// ── Status & priority data (mirrors dom-prosto-z-pomyslu crmTypes.ts) ─────────

const STATUS_LABELS: Record<string, string> = {
  do_przypisania: "Do przypisania",
  nowy: "Nowy",
  do_kontaktu: "Do kontaktu",
  brak_kontaktu: "Brak kontaktu",
  skontaktowany: "Skontaktowany",
  spotkanie_umowione: "Spotkanie umówione",
  po_spotkaniu: "Po spotkaniu",
  przygotowanie_wyceny: "Przyg. wyceny",
  oferta_wyslana: "Oferta wysłana",
  follow_up: "Follow-up",
  negocjacje: "Negocjacje",
  przygotowanie_umowy: "Przyg. umowy",
  finansowanie: "Finansowanie",
  wygrany: "Wygrany",
  przegrany: "Przegrany",
  zimny_lead: "Zimny lead",
};

const STATUS_COLORS: Record<string, string> = {
  do_przypisania: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  nowy: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  do_kontaktu: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  brak_kontaktu: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  skontaktowany: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  spotkanie_umowione: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  po_spotkaniu: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  przygotowanie_wyceny: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  oferta_wyslana: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  follow_up: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  negocjacje: "bg-amber-600/20 text-amber-400 border-amber-600/30",
  przygotowanie_umowy: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  finansowanie: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  wygrany: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  przegrany: "bg-red-500/20 text-red-400 border-red-500/30",
  zimny_lead: "bg-sky-500/20 text-sky-400 border-sky-500/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  niski: "bg-green-500/20 text-green-400 border-green-500/30",
  sredni: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  wysoki: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  goracy: "bg-red-500/20 text-red-400 border-red-500/30",
};

const PRIORITY_LABELS: Record<string, string> = {
  niski: "Niski",
  sredni: "Średni",
  wysoki: "Wysoki",
  goracy: "Gorący",
};

// ── Mock data (realistic housing/OZE CRM data) ────────────────────────────────

const PREVIEW_LEADS = [
  { id: 1, name: "Marcin Kowalski",    phone: "+48 600 100 200", model: "Wenecja",  status: "negocjacje",         priority: "goracy", lead_score: 92, next_step: "Podpisanie umowy",     next_action_date: "02.05.2026" },
  { id: 2, name: "Anna Nowak",          phone: "+48 500 200 300", model: "Siena",    status: "oferta_wyslana",     priority: "wysoki", lead_score: 78, next_step: "Follow-up tel.",     next_action_date: "03.05.2026" },
  { id: 3, name: "Tomasz Wiśniewski",  phone: "+48 700 300 400", model: "Mediolan", status: "spotkanie_umowione", priority: "wysoki", lead_score: 71, next_step: "Spotkanie na dz.",   next_action_date: "05.05.2026" },
  { id: 4, name: "Karolina Zając",      phone: "+48 510 400 500", model: "Verona",   status: "po_spotkaniu",       priority: "sredni", lead_score: 58, next_step: "Przyg. wyceny",     next_action_date: "06.05.2026" },
  { id: 5, name: "Piotr Lewandowski",  phone: "+48 660 500 600", model: "Wenecja",  status: "skontaktowany",      priority: "sredni", lead_score: 45, next_step: "Umów spotkanie",    next_action_date: "08.05.2026" },
  { id: 6, name: "Magdalena Dąbrowska",phone: "+48 720 600 700", model: "Lazio",    status: "finansowanie",       priority: "wysoki", lead_score: 83, next_step: "Decyzja banku",     next_action_date: "10.05.2026" },
  { id: 7, name: "Jakub Szymański",    phone: "+48 690 700 800", model: "Siena",    status: "przygotowanie_wyceny",priority: "sredni", lead_score: 62, next_step: "Wyślij ofertę",    next_action_date: "07.05.2026" },
  { id: 8, name: "Ewa Kamińska",       phone: "+48 600 800 900", model: "Mediolan", status: "wygrany",            priority: "goracy", lead_score: 97, next_step: "Realizacja proj.", next_action_date: null },
];

const PREVIEW_TASKS = [
  { id: 1, title: "Zadzwoń do Marcina Kowalskiego — finalizacja umowy", lead: "Marcin Kowalski",    type: "Telefon",   due: "01.05.2026", overdue: true  },
  { id: 2, title: "Wyślij wycenę Jakubowi Szymańskiemu",               lead: "Jakub Szymański",    type: "Email",     due: "02.05.2026", overdue: false },
  { id: 3, title: "Follow-up Annie Nowak po wysłaniu oferty",          lead: "Anna Nowak",          type: "Telefon",   due: "03.05.2026", overdue: false },
  { id: 4, title: "Spotkanie z Tomaszem na działce",                   lead: "Tomasz Wiśniewski",  type: "Spotkanie", due: "05.05.2026", overdue: false },
  { id: 5, title: "Sprawdź decyzję banku — Magdalena Dąbrowska",      lead: "Magdalena Dąbrowska",type: "Finansow.",  due: "30.04.2026", overdue: true  },
];

const FUNNEL_STAGES = [
  { status: "nowy",                color: "bg-blue-500",   label: "Nowy",             count: 8  },
  { status: "skontaktowany",       color: "bg-teal-500",   label: "Skontaktowany",    count: 11 },
  { status: "spotkanie_umowione",  color: "bg-violet-500", label: "Spotkanie",        count: 7  },
  { status: "oferta_wyslana",      color: "bg-orange-500", label: "Oferta",           count: 9  },
  { status: "negocjacje",          color: "bg-amber-500",  label: "Negocjacje",       count: 4  },
  { status: "finansowanie",        color: "bg-lime-500",   label: "Finansowanie",     count: 3  },
  { status: "wygrany",             color: "bg-emerald-500",label: "Wygrany",          count: 5  },
];

const KANBAN_COLUMNS = [
  { status: "nowy",               label: "Nowy",          color: "border-blue-500/40",   leads: [{ name: "Rafał Maj", model: "Wenecja", score: 34 }, { name: "Zofia Piotrak", model: "Siena", score: 28 }] },
  { status: "skontaktowany",      label: "Skontaktowany", color: "border-teal-500/40",   leads: [{ name: "Piotr Lewandowski", model: "Wenecja", score: 45 }, { name: "Joanna Wróbel", model: "Lazio", score: 51 }, { name: "Kamil Błaszczyk", model: "Verona", score: 39 }] },
  { status: "spotkanie_umowione", label: "Spotkanie",     color: "border-violet-500/40", leads: [{ name: "Tomasz Wiśniewski", model: "Mediolan", score: 71 }] },
  { status: "oferta_wyslana",     label: "Oferta",        color: "border-orange-500/40", leads: [{ name: "Anna Nowak", model: "Siena", score: 78 }, { name: "Jakub Szymański", model: "Siena", score: 62 }] },
  { status: "negocjacje",         label: "Negocjacje",    color: "border-amber-500/40",  leads: [{ name: "Marcin Kowalski", model: "Wenecja", score: 92 }] },
  { status: "wygrany",            label: "Wygrany",       color: "border-emerald-500/40",leads: [{ name: "Ewa Kamińska", model: "Mediolan", score: 97 }] },
];

function fmt(iso: string | null) {
  if (!iso) return "—";
  return iso;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarItem { label: string; icon: any; }
interface SidebarSection { group: string; items: SidebarItem[]; }

const NAV_SECTIONS: SidebarSection[] = [
  {
    group: "Sprzedaż",
    items: [
      { label: "Dashboard",  icon: LayoutDashboard },
      { label: "Leady",      icon: ListChecks },
      { label: "Zadania",    icon: CheckSquare },
      { label: "Kalendarz",  icon: CalendarDays },
      { label: "Oferty",     icon: FileText },
    ],
  },
  {
    group: "Operacje",
    items: [
      { label: "Finansowanie",  icon: Banknote },
      { label: "Realizacja",    icon: HardHat },
      { label: "Ekipy",         icon: Users },
      { label: "Analytics",     icon: BarChart3 },
      { label: "Newsletter",    icon: Mail },
      { label: "Powiadomienia", icon: Bell },
    ],
  },
  {
    group: "Monitor Banków",
    items: [
      { label: "Monitor Banków", icon: Landmark },
    ],
  },
  {
    group: "Administracja",
    items: [
      { label: "Kontrola procesu", icon: Target },
      { label: "Użytkownicy",      icon: Users },
      { label: "Ustawienia",       icon: Settings },
    ],
  },
];

const INTERACTIVE_LABELS = ["Dashboard", "Leady", "Zadania", "Kanban", "Analytics"];
type ActiveView = "Dashboard" | "Leady" | "Zadania" | "Kanban" | "Analytics";

function PreviewSidebar({ active, onSelect }: { active: string; onSelect: (v: string) => void }) {
  return (
    <div className="w-52 flex-shrink-0 bg-[#070710] border-r border-white/10 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10">
        <div className="text-xs font-bold bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent tracking-widest">EKOTECHNIKA OZE</div>
        <div className="text-[10px] text-gray-500 mt-0.5">Panel CRM</div>
      </div>
      {/* User card */}
      <div className="mx-3 my-2.5 p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#8A2BE2]/20 border border-[#8A2BE2]/30 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-purple-300">MK</span>
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-white truncate">Marek Kowalczyk</div>
          <div className="text-[10px] text-gray-500">Manager</div>
        </div>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
      </div>
      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-1 space-y-3">
        {NAV_SECTIONS.map(section => (
          <div key={section.group}>
            <div className="px-4 pb-1 text-[9px] text-gray-600 uppercase tracking-[0.15em] font-bold">{section.group}</div>
            <div className="space-y-0.5 px-2">
              {section.items.map(item => {
                const isInteractive = INTERACTIVE_LABELS.includes(item.label);
                const isActive = active === item.label;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => isInteractive ? onSelect(item.label) : undefined}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all text-[12px] ${
                      isActive
                        ? "bg-[#00F0FF]/10 text-[#00F0FF] font-semibold"
                        : isInteractive
                        ? "text-gray-400 hover:bg-white/5 hover:text-gray-200 cursor-pointer"
                        : "text-gray-600 cursor-default"
                    }`}
                  >
                    {isActive && <span className="absolute left-0 w-[3px] h-4 rounded-r-full bg-[#00F0FF]" />}
                    <IconComp size={13} className={isActive ? "text-[#00F0FF]" : ""} />
                    <span>{item.label}</span>
                    {item.label === "Zadania" && (
                      <span className="ml-auto text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-1.5 py-0.5 font-bold">3</span>
                    )}
                    {item.label === "Leady" && (
                      <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-1.5 py-0.5 font-bold">8</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors font-semibold">
          <Plus size={12} /> Nowy lead
        </button>
        <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
          <Home size={12} /> Strona główna
        </button>
        <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-gray-500 hover:text-red-400 transition-colors">
          <LogOut size={12} /> Wyloguj
        </button>
      </div>
    </div>
  );
}

// ── Views ─────────────────────────────────────────────────────────────────────

function DashboardView() {
  return (
    <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "520px" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Dashboard</h2>
        <span className="text-[11px] text-gray-500">01.05.2026</span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Wszystkie leady",  value: "47",    sub: "+3 dziś",     gradient: "from-[#00F0FF] to-[#8A2BE2]" },
          { label: "Gorące leady",     value: "8",     sub: "priorytet 🔥", gradient: "from-red-400 to-orange-500" },
          { label: "Zadania zaległe",  value: "3",     sub: "wymagają uwagi",gradient: "from-red-500 to-rose-600" },
          { label: "Konwersja",        value: "18.2%", sub: "wygranych/total",gradient: "from-emerald-400 to-teal-500" },
        ].map(m => (
          <div key={m.label} className="bg-[#0A0A12] border border-white/10 rounded-xl p-3.5">
            <div className={`text-2xl font-black bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent`}>{m.value}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{m.label}</div>
            <div className="text-[10px] text-gray-600 mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Today + AI Scoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Dzisiaj */}
        <div className="bg-[#0A0A12] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className="text-[#00F0FF]" />
            <span className="text-[12px] font-semibold text-white">Dzisiaj</span>
          </div>
          <div className="space-y-2">
            {[
              { title: "Zadzwoń do Marcina K.", type: "Telefon",   time: "10:00", overdue: true  },
              { title: "Spotkanie — Tomasz W.", type: "Spotkanie", time: "13:00", overdue: false },
              { title: "Wyślij wycenę — Jakub S.",type: "Email",  time: "15:00", overdue: false },
            ].map(t => (
              <div key={t.title} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] ${
                t.overdue ? "bg-red-500/10 border border-red-500/20" : "bg-white/5"
              }`}>
                {t.overdue ? <AlertTriangle size={11} className="text-red-400 flex-shrink-0" /> : <CheckSquare size={11} className="text-gray-500 flex-shrink-0" />}
                <span className={`flex-1 ${t.overdue ? "text-red-300" : "text-gray-300"}`}>{t.title}</span>
                <span className="text-gray-600">{t.time}</span>
                <span className="text-gray-500 bg-white/5 rounded px-1.5">{t.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Scoring */}
        <div className="bg-[#0A0A12] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={13} className="text-purple-400" />
            <span className="text-[12px] font-semibold text-white">AI Scoring — Priorytety</span>
          </div>
          <div className="space-y-2">
            {[
              { name: "Marcin Kowalski",    score: 92, label: "Negocjacje — gotowy do umowy",        color: "from-emerald-500 to-teal-500" },
              { name: "Magdalena Dąbrowska",score: 83, label: "Finansowanie — czeka na bank",       color: "from-lime-500 to-green-500" },
              { name: "Anna Nowak",          score: 78, label: "Oferta wysłana — wymagany follow-up",color: "from-amber-500 to-orange-500" },
            ].map(a => (
              <div key={a.name} className="flex items-center gap-2.5">
                <div className={`text-[11px] font-black w-7 text-center bg-gradient-to-r ${a.color} bg-clip-text text-transparent`}>{a.score}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-white truncate">{a.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{a.label}</div>
                </div>
                <div className="w-16 bg-white/10 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full bg-gradient-to-r ${a.color}`} style={{ width: `${a.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lejek konwersji */}
      <div className="bg-[#0A0A12] border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <PieChart size={13} className="text-[#00F0FF]" />
          <span className="text-[12px] font-semibold text-white">Lejek sprzedaży</span>
          <span className="ml-auto text-[10px] text-gray-500">47 leadów łącznie</span>
        </div>
        <div className="space-y-1.5">
          {FUNNEL_STAGES.map(s => (
            <div key={s.status} className="flex items-center gap-2">
              <div className="text-[10px] text-gray-400 w-24 truncate">{s.label}</div>
              <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                <div className={`h-3 rounded-full ${s.color}/70`} style={{ width: `${(s.count / 47) * 100}%` }} />
              </div>
              <div className="text-[11px] font-bold text-white w-5 text-right">{s.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadsView() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = PREVIEW_LEADS.find(l => l.id === selectedId);

  return (
    <div className="flex flex-col overflow-hidden" style={{ maxHeight: "520px" }}>
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-white">Leady</span>
        <span className="text-[11px] text-gray-500">({PREVIEW_LEADS.length})</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 opacity-60">
            <Filter size={11} className="text-gray-400" />
            <span className="text-[11px] text-gray-400">Filtruj</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 opacity-60">
            <span className="text-[11px] text-gray-400">Wszystkie statusy</span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-[#070710] z-10">
              <tr className="border-b border-white/10 text-gray-500 uppercase text-[10px]">
                <th className="px-4 py-2.5 text-left">Imię i nazwisko</th>
                <th className="px-3 py-2.5 text-left hidden sm:table-cell">Telefon</th>
                <th className="px-3 py-2.5 text-left">Model</th>
                <th className="px-3 py-2.5 text-left">Status</th>
                <th className="px-3 py-2.5 text-left hidden md:table-cell">Priorytet</th>
                <th className="px-3 py-2.5 text-left hidden lg:table-cell">Score</th>
                <th className="px-3 py-2.5 text-left hidden xl:table-cell">Next step</th>
                <th className="px-3 py-2.5 text-left hidden xl:table-cell">Termin</th>
              </tr>
            </thead>
            <tbody>
              {PREVIEW_LEADS.map(lead => {
                const sc = STATUS_COLORS[lead.status] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
                const pc = PRIORITY_COLORS[lead.priority] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedId(selectedId === lead.id ? null : lead.id)}
                    className={`border-b border-white/5 cursor-pointer transition-colors ${
                      selectedId === lead.id ? "bg-[#00F0FF]/5 border-[#00F0FF]/20" : "hover:bg-white/5"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-semibold text-white">{lead.name}</td>
                    <td className="px-3 py-2.5 text-gray-400 hidden sm:table-cell">{lead.phone}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-[#00F0FF]/80 font-medium">{lead.model}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${sc}`}>
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${pc}`}>
                        {lead.priority === "goracy" ? "🔥 " : ""}{PRIORITY_LABELS[lead.priority]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 bg-white/10 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              lead.lead_score >= 80 ? "bg-emerald-500" : lead.lead_score >= 60 ? "bg-amber-500" : "bg-slate-500"
                            }`}
                            style={{ width: `${lead.lead_score}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-300 font-bold">{lead.lead_score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 hidden xl:table-cell">{lead.next_step}</td>
                    <td className="px-3 py-2.5 text-gray-500 hidden xl:table-cell">{fmt(lead.next_action_date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Lead detail panel */}
        {selected && (
          <div className="w-56 flex-shrink-0 border-l border-white/10 bg-[#070710] overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[12px] font-bold text-white">{selected.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{selected.phone}</div>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] text-gray-600 mb-1">Model</div>
                <div className="text-[12px] font-semibold text-[#00F0FF]">{selected.model}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 mb-1">Status</div>
                <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${
                  STATUS_COLORS[selected.status] ?? ""
                }`}>{STATUS_LABELS[selected.status]}</span>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 mb-1">Priorytet</div>
                <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${
                  PRIORITY_COLORS[selected.priority] ?? ""
                }`}>{selected.priority === "goracy" ? "🔥 " : ""}{PRIORITY_LABELS[selected.priority]}</span>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 mb-1">AI Score</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selected.lead_score >= 80 ? "bg-emerald-500" : selected.lead_score >= 60 ? "bg-amber-500" : "bg-slate-500"
                      }`}
                      style={{ width: `${selected.lead_score}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-black text-white">{selected.lead_score}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 mb-1">Next step</div>
                <div className="text-[11px] text-gray-300">{selected.next_step}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 mb-1">Termin</div>
                <div className="text-[11px] text-gray-300">{fmt(selected.next_action_date)}</div>
              </div>
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <button className="w-full flex items-center gap-1.5 text-[11px] text-[#00F0FF]/70 bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded-lg px-3 py-1.5 opacity-60 cursor-not-allowed">
                  <Phone size={11} /> Zadzwoń
                </button>
                <button className="w-full flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 opacity-60 cursor-not-allowed">
                  <FileText size={11} /> Generuj ofertę
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TasksView() {
  const [filter, setFilter] = useState<"all" | "today" | "overdue">("all");
  const filtered = PREVIEW_TASKS.filter(t =>
    filter === "all" ? true : filter === "overdue" ? t.overdue : !t.overdue
  );
  return (
    <div className="flex flex-col overflow-hidden" style={{ maxHeight: "520px" }}>
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-white">Zadania</span>
        <div className="ml-auto flex gap-1">
          {(["all", "today", "overdue"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                filter === f ? "bg-white/10 text-white font-semibold" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {f === "all" ? "Wszystkie" : f === "today" ? "Nadchodzące" : "Zaległe"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.map(task => (
          <div
            key={task.id}
            className={`rounded-xl px-4 py-3 border transition-colors ${
              task.overdue
                ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
            }`}
          >
            <div className="flex items-start gap-3">
              {task.overdue
                ? <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                : <CheckSquare size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className={`text-[12px] font-semibold ${task.overdue ? "text-red-200" : "text-white"}`}>
                  {task.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500">{task.lead}</span>
                  <span className="text-[10px] bg-white/10 rounded px-1.5 py-0.5 text-gray-400">{task.type}</span>
                  {task.overdue && <span className="text-[10px] text-red-400 font-semibold">⚠ Zaległe</span>}
                </div>
              </div>
              <div className={`text-[10px] flex-shrink-0 ${
                task.overdue ? "text-red-400 font-bold" : "text-gray-500"
              }`}>
                {task.due}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-[12px]">Brak zadań w tej kategorii</div>
        )}
      </div>
    </div>
  );
}

function KanbanView() {
  return (
    <div className="flex flex-col overflow-hidden" style={{ maxHeight: "520px" }}>
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-white">Kanban — Pipeline</span>
        <span className="ml-auto text-[10px] text-gray-500">Przeciągnij kartę aby zmienić status</span>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-3 h-full" style={{ minWidth: `${KANBAN_COLUMNS.length * 160}px` }}>
          {KANBAN_COLUMNS.map(col => (
            <div key={col.status} className="w-40 flex-shrink-0 flex flex-col">
              <div className={`border-t-2 ${col.color} rounded-t-lg bg-white/5 px-3 py-2 mb-2`}>
                <div className="text-[11px] font-bold text-white">{col.label}</div>
                <div className="text-[10px] text-gray-500">{col.leads.length} leadów</div>
              </div>
              <div className="space-y-2 flex-1">
                {col.leads.map(lead => (
                  <div key={lead.name} className="bg-[#0A0A12] border border-white/10 rounded-lg p-2.5 hover:border-white/20 transition-colors cursor-pointer">
                    <div className="text-[11px] font-semibold text-white leading-tight">{lead.name}</div>
                    <div className="text-[10px] text-[#00F0FF]/70 mt-1">{lead.model}</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex-1 bg-white/10 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${
                            lead.score >= 80 ? "bg-emerald-500" : lead.score >= 60 ? "bg-amber-500" : "bg-slate-500"
                          }`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-gray-400">{lead.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsView() {
  const total = FUNNEL_STAGES.reduce((s, f) => s + f.count, 0);
  return (
    <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "520px" }}>
      <h2 className="text-[13px] font-bold text-white">Analytics — Raporty sprzedaży</h2>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Leady łącznie",  value: "47",    color: "text-[#00F0FF]" },
          { label: "Wygrane",        value: "5",     color: "text-emerald-400" },
          { label: "Konwersja",      value: "10.6%", color: "text-amber-400" },
        ].map(m => (
          <div key={m.label} className="bg-[#0A0A12] border border-white/10 rounded-xl p-3 text-center">
            <div className={`text-xl font-black ${m.color}`}>{m.value}</div>
            <div className="text-[10px] text-gray-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0A0A12] border border-white/10 rounded-xl p-4">
        <div className="text-[12px] font-semibold text-white mb-3">Lejek — rozkład leadów</div>
        <div className="space-y-2">
          {FUNNEL_STAGES.map(s => (
            <div key={s.status} className="flex items-center gap-3">
              <div className="text-[10px] text-gray-400 w-28 truncate">{s.label}</div>
              <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden relative">
                <div className={`h-4 rounded-full ${s.color}/60 transition-all`} style={{ width: `${(s.count / total) * 100}%` }} />
                <span className="absolute inset-0 flex items-center pl-2 text-[10px] text-white/70 font-semibold">{s.count}</span>
              </div>
              <div className="text-[10px] text-gray-500 w-8">{((s.count / total) * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#0A0A12] border border-white/10 rounded-xl p-4">
        <div className="text-[12px] font-semibold text-white mb-3">Wyniki wg modelu domu</div>
        <div className="space-y-2">
          {[
            { model: "Wenecja",  leads: 14, won: 2 },
            { model: "Siena",    leads: 11, won: 1 },
            { model: "Mediolan", leads: 9,  won: 1 },
            { model: "Verona",   leads: 8,  won: 1 },
            { model: "Lazio",    leads: 5,  won: 0 },
          ].map(row => (
            <div key={row.model} className="flex items-center gap-3">
              <div className="text-[11px] text-[#00F0FF]/80 font-semibold w-20">{row.model}</div>
              <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                <div className="h-3 rounded-full bg-[#8A2BE2]/60" style={{ width: `${(row.leads / 14) * 100}%` }} />
              </div>
              <div className="text-[10px] text-gray-400 w-12">{row.leads} leadów</div>
              <div className="text-[10px] text-emerald-400 w-16">{row.won} wygranych</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main CRM Preview ──────────────────────────────────────────────────────────

function DomCRMPreview() {
  const [active, setActive] = useState<ActiveView>("Dashboard");

  const topNavTabs: ActiveView[] = ["Dashboard", "Leady", "Zadania", "Kanban", "Analytics"];

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
            crm.ekotechnika-oze.pl · Panel CRM
          </div>
        </div>
        {/* Quick-access tabs */}
        <div className="hidden sm:flex items-center gap-1">
          {topNavTabs.map(t => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                active === t ? "bg-white/15 text-white font-semibold" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* App shell: sidebar + content */}
      <div className="flex" style={{ height: "560px" }}>
        <PreviewSidebar active={active} onSelect={(v) => setActive(v as ActiveView)} />

        {/* Content area */}
        <div className="flex-1 bg-[#040408] overflow-hidden">
          {active === "Dashboard"  && <DashboardView />}
          {active === "Leady"      && <LeadsView />}
          {active === "Zadania"    && <TasksView />}
          {active === "Kanban"     && <KanbanView />}
          {active === "Analytics" && <AnalyticsView />}
        </div>
      </div>
    </div>
  );
}

// ── Integrations ──────────────────────────────────────────────────────────────

const INTEGRATION_GROUPS = [
  {
    title: "API & Techniczne",
    icon: Code,
    accent: "#00F0FF",
    items: [
      { name: "REST API",  desc: "Pełna integracja przez HTTP/JSON — własne aplikacje, ERP, bazy danych, dowolne zewnętrzne systemy." },
      { name: "Webhooks",  desc: "Real-time eventy przy każdej akcji — nowy lead, zmiana statusu, wygrany deal, zadanie zaległe." },
      { name: "GraphQL",   desc: "Elastyczne zapytania dla zaawansowanych integracji i raportowania danych w czasie rzeczywistym." },
    ],
  },
  {
    title: "Automatyzacje no-code",
    icon: Zap,
    accent: "#F59E0B",
    items: [
      { name: "Zapier",    desc: "Połącz z 6000+ aplikacjami bez kodu — Gmail, Google Sheets, Trello, Notion i tysiące innych." },
      { name: "Make.com",  desc: "Zaawansowane scenariusze z warunkami, pętlami i transformacjami danych bez ograniczeń." },
      { name: "n8n",       desc: "Open-source automation z własnym hostingiem — pełna kontrola nad przepływami bez abonamentów." },
    ],
  },
  {
    title: "Komunikacja & Email",
    icon: Mail,
    accent: "#A855F7",
    items: [
      { name: "Email SMTP/IMAP",       desc: "Dwukierunkowa synchronizacja — cała korespondencja widoczna w profilu leada." },
      { name: "WhatsApp Business API", desc: "Wysyłaj i odbieraj wiadomości WhatsApp bezpośrednio z karty klienta w CRM." },
      { name: "SMS via Twilio",        desc: "Automatyczne i ręczne SMS z szablonami, harmonogramem i śledzeniem dostarczenia." },
    ],
  },
  {
    title: "Marketing & Lead Gen",
    icon: TrendingUp,
    accent: "#10B981",
    items: [
      { name: "Facebook Lead Ads",  desc: "Leady z kampanii Meta trafiają do CRM w czasie rzeczywistym z auto-przypisaniem handlowca." },
      { name: "Google Ads / Forms", desc: "Importuj leady z formularzy Google i śledź ROI każdej kampanii w dashboardzie CRM." },
      { name: "Formularz embed",    desc: "Wstaw formularz na stronę — każde zgłoszenie to automatycznie nowy lead z tracking UTM." },
    ],
  },
  {
    title: "Workspace & Powiadomienia",
    icon: Bell,
    accent: "#6366F1",
    items: [
      { name: "Google Workspace", desc: "Synchronizacja z Gmail, Google Calendar i Drive — spotkania i email zsynchronizowane z CRM." },
      { name: "Slack",            desc: "Powiadomienia o leadach, statusach i zadaniach zaległych bezpośrednio na kanale Slack." },
      { name: "Microsoft 365",    desc: "Integracja z Outlook, Teams i OneDrive dla firm działających w ekosystemie Microsoft." },
    ],
  },
  {
    title: "Bazy danych & Storage",
    icon: Database,
    accent: "#EF4444",
    items: [
      { name: "PostgreSQL / MySQL", desc: "Import historycznych danych klientów i synchronizacja dwustronna z własną bazą." },
      { name: "Google Sheets",      desc: "Eksportuj raporty i synchronizuj dane z arkuszami — dostępne dla całego zespołu." },
      { name: "S3 / R2 Storage",    desc: "Dokumenty, oferty i pliki klientów w chmurze — dostęp z poziomu karty leada." },
    ],
  },
];

const FEATURES = [
  { icon: ListChecks, title: "16-etapowy pipeline",           desc: "Od Do przypisania do Wygranego — każdy lead ma precyzyjny status, historię i właściciela." },
  { icon: Brain,      title: "AI Scoring leadów",             desc: "Automatyczna ocena szansy zamknięcia — system wskazuje, komu zadzwonić w pierwszej kolejności." },
  { icon: Banknote,   title: "Moduł finansowania",            desc: "Śledzenie wniosków kredytowych, decyzji banku i dokumentów finansowych klienta — w jednym miejscu." },
  { icon: Landmark,   title: "Monitor banków (OZE)",          desc: "Bieżące oferty kredytowe i porównanie oprocentowania banków z automatycznym alertem zmian." },
  { icon: HardHat,    title: "Realizacja i ekipy budowlane",  desc: "Zarządzanie projektami budowlanymi, zleceniami dla ekip, harmonogramem i postępem prac." },
  { icon: Building2,  title: "Modele domów",                  desc: "Katalog modeli (Wenecja, Siena, Mediolan, Verona, Lazio) z wycenami i konfiguratorem oferty." },
  { icon: Users,      title: "Multi-role & team",             desc: "Admin, manager, handlowiec, finansowanie, realizacja, ekipa — każda rola widzi to, co powinna." },
  { icon: BarChart3,  title: "Analytics w czasie rzeczywistym",desc: "Konwersja wg modelu, handlowca, kampanii — wykresy i raporty exportowalne do PDF/Excel." },
  { icon: Wrench,     title: "Własna instancja",              desc: "Twoje dane na Twoim serwerze. Zero ograniczeń od liczby użytkowników, zero abonamentu od siedzenia." },
];

const PIPELINE_STATUSES = [
  { label: "Nowy",             color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { label: "Do kontaktu",      color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { label: "Skontaktowany",    color: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  { label: "Spotkanie",        color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  { label: "Wycena",           color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  { label: "Oferta wysłana",   color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { label: "Follow-up",        color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { label: "Negocjacje",       color: "bg-amber-600/20 text-amber-300 border-amber-600/30" },
  { label: "Przygot. umowy",   color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { label: "Finansowanie",     color: "bg-lime-500/20 text-lime-300 border-lime-500/30" },
  { label: "Wygrany",          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
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
            Dedykowany CRM SaaS — budownictwo, OZE, deweloperzy
          </div>
          <h1 className="font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter mb-6 leading-tight">
            CRM dla firm,{" "}
            <span className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
              które budują
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            16-etapowy pipeline, AI scoring leadów, moduł finansowania hipotecznego,
            monitor banków, zarządzanie ekipami budowlanymi i integracja z 20+ narzędziami —
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
            {["Wdrożenie w 48h", "Własna instancja", "16 etapów pipeline", "AI Scoring", "Monitor banków", "Bez limitu użytkowników"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={13} className="text-[#00F0FF]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CRM Preview */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Interaktywny podgląd — kliknij zakładki w sidebarze lub u góry
            </div>
          </div>
          <DomCRMPreview />
          <p className="text-center text-sm text-gray-600 mt-4">
            Podgląd panelu CRM — {" "}
            <span className="text-gray-500">Dashboard · Leady · Zadania · Kanban · Analytics · Finansowanie · Realizacja · Ekipy · Monitor Banków</span>
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
              Masz własny ERP, CMS, albo system rozliczeniowy? Wdrożymy dedykowaną integrację przez REST API lub Webhook.
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
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-4">Wszystko czego potrzebuje firma budowlana</h2>
            <p className="text-gray-400">Jeden system zamiast Excela, notesu i dziesiątek arkuszy.</p>
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
            <h2 className="text-3xl font-black tracking-tighter text-white mb-3">Pipeline sprzedaży — 16 etapów</h2>
            <p className="text-gray-400">Pełna kontrola nad każdym leadem od pierwszego kontaktu do podpisanej umowy.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {PIPELINE_STATUSES.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className={`px-3 py-1.5 rounded-full border text-sm font-medium ${s.color}`}>{s.label}</span>
                {i < PIPELINE_STATUSES.length - 1 && <ChevronRight size={14} className="text-gray-700" />}
              </div>
            ))}
          </div>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Flame, title: "Priorytet gorący",     desc: "System automatycznie oznacza leady wymagające natychmiastowej akcji na podstawie daty i statusu.", color: "text-red-400" },
              { icon: Brain, title: "AI Score 0–100",       desc: "Każdy lead dostaje ocenę szansy zamknięcia — algorytm uwzględnia aktywność, terminy i historię kontaktu.", color: "text-purple-400" },
              { icon: Target,title: "Kontrola procesu",    desc: "Manager widzi w czasie rzeczywistym które leady stoją w miejscu i które wymagają interwencji.", color: "text-[#00F0FF]" },
            ].map(item => (
              <div key={item.title} className="bg-[#0A0A10] border border-white/10 rounded-xl p-4">
                <item.icon size={18} className={`${item.color} mb-2`} />
                <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-4">Gotowy na CRM skrojony pod budownictwo?</h2>
          <p className="text-gray-400 mb-8">Skontaktuj się z nami — wdrożymy system dopasowany do Twojego procesu sprzedaży i realizacji w ciągu 48 godzin.</p>
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
          <div className="bg-[#0A0A10] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <span className="font-bold text-white">Demo — Panel CRM</span>
                <p className="text-xs text-gray-400 mt-0.5">Przykładowe dane, możesz swobodnie eksplorować</p>
              </div>
              <button onClick={() => setDemoOpen(false)} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DomCRMPreview />
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-gray-400 text-sm">Chcesz taki system dla swojej firmy?</p>
              <Link
                to="/#contact"
                onClick={() => setDemoOpen(false)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-bold px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity text-sm"
              >
                Zamów wdrożenie <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
