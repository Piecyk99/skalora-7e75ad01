import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, FileText, Bell,
  Star, Zap, Shield, Globe, TrendingUp,
  Mail, Code, Database, Layers, Check, Users, BarChart3,
  LayoutDashboard, ListChecks, CheckSquare, CalendarDays, Banknote,
  HardHat, Target, Settings, LogOut, Home, Plus, Landmark,
  AlertTriangle, Clock, Phone, Flame, ChevronRight, Filter,
  Brain, Building2, Wrench, PieChart, Package, Star as StarIcon,
  TrendingDown, CheckCircle, XCircle, AlertCircle, Eye,
} from "lucide-react";

// ── Status data (mirrors dom-prosto-z-pomyslu crmTypes.ts) ───────────────────

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

const FIN_STATUS_COLORS: Record<string, string> = {
  nowe: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  kontakt_do_wykonania: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  w_trakcie_analizy: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  czekam_na_dokumenty: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  wniosek_zlozony: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  decyzja_pozytywna: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  decyzja_negatywna: "bg-red-500/20 text-red-400 border-red-500/30",
  wstrzymane: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const FIN_STATUS_LABELS: Record<string, string> = {
  nowe: "Nowe",
  kontakt_do_wykonania: "Do kontaktu",
  w_trakcie_analizy: "W trakcie analizy",
  czekam_na_dokumenty: "Czeka na dokumenty",
  wniosek_zlozony: "Wniosek złożony",
  decyzja_pozytywna: "Decyzja pozytywna",
  decyzja_negatywna: "Decyzja negatywna",
  wstrzymane: "Wstrzymane",
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

// ── Mock data ────────────────────────────────────────────────────────────────

const PREVIEW_LEADS = [
  { id: 1, name: "Marcin Kowalski",    phone: "+48 600 100 200", model: "Wenecja",  status: "negocjacje",          priority: "goracy", lead_score: 92, next_step: "Podpisanie umowy",    next_action_date: "02.05.2026" },
  { id: 2, name: "Anna Nowak",         phone: "+48 500 200 300", model: "Siena",    status: "oferta_wyslana",      priority: "wysoki", lead_score: 78, next_step: "Follow-up tel.",    next_action_date: "03.05.2026" },
  { id: 3, name: "Tomasz Wiśniewski",  phone: "+48 700 300 400", model: "Mediolan", status: "spotkanie_umowione",  priority: "wysoki", lead_score: 71, next_step: "Spotkanie na dz.",  next_action_date: "05.05.2026" },
  { id: 4, name: "Karolina Zając",     phone: "+48 510 400 500", model: "Verona",   status: "po_spotkaniu",        priority: "sredni", lead_score: 58, next_step: "Przyg. wyceny",    next_action_date: "06.05.2026" },
  { id: 5, name: "Piotr Lewandowski",  phone: "+48 660 500 600", model: "Wenecja",  status: "skontaktowany",       priority: "sredni", lead_score: 45, next_step: "Umów spotkanie",   next_action_date: "08.05.2026" },
  { id: 6, name: "Magdalena Dąbrowska",phone: "+48 720 600 700", model: "Lazio",    status: "finansowanie",        priority: "wysoki", lead_score: 83, next_step: "Decyzja banku",    next_action_date: "10.05.2026" },
  { id: 7, name: "Jakub Szymański",    phone: "+48 690 700 800", model: "Siena",    status: "przygotowanie_wyceny",priority: "sredni", lead_score: 62, next_step: "Wyślij ofertę",   next_action_date: "07.05.2026" },
  { id: 8, name: "Ewa Kamińska",       phone: "+48 600 800 900", model: "Mediolan", status: "wygrany",             priority: "goracy", lead_score: 97, next_step: "Realizacja proj.", next_action_date: null },
];

const PREVIEW_TASKS = [
  { id: 1, title: "Zadzwoń do Marcina Kowalskiego — finalizacja umowy",  lead: "Marcin Kowalski",    type: "Telefon",   due: "01.05.2026", overdue: true  },
  { id: 2, title: "Wyślij wycenę Jakubowi Szymańskiemu",                 lead: "Jakub Szymański",    type: "Email",     due: "02.05.2026", overdue: false },
  { id: 3, title: "Follow-up Annie Nowak po wysłaniu oferty",            lead: "Anna Nowak",         type: "Telefon",   due: "03.05.2026", overdue: false },
  { id: 4, title: "Spotkanie z Tomaszem na działce",                     lead: "Tomasz Wiśniewski",  type: "Spotkanie", due: "05.05.2026", overdue: false },
  { id: 5, title: "Sprawdź decyzję banku — Magdalena Dąbrowska",         lead: "Magdalena Dąbrowska",type: "Finansow.", due: "30.04.2026", overdue: true  },
];

const FUNNEL_STAGES = [
  { color: "bg-blue-500",    label: "Nowy",          count: 8  },
  { color: "bg-teal-500",    label: "Skontaktowany",  count: 11 },
  { color: "bg-violet-500",  label: "Spotkanie",      count: 7  },
  { color: "bg-orange-500",  label: "Oferta",         count: 9  },
  { color: "bg-amber-500",   label: "Negocjacje",     count: 4  },
  { color: "bg-lime-500",    label: "Finansowanie",   count: 3  },
  { color: "bg-emerald-500", label: "Wygrany",        count: 5  },
];

const KANBAN_COLUMNS = [
  { label: "Nowy",          color: "border-blue-500/40",    leads: [{ name: "Rafał Maj",          model: "Wenecja",  score: 34 }, { name: "Zofia Piotrak",      model: "Siena",    score: 28 }] },
  { label: "Skontaktowany", color: "border-teal-500/40",   leads: [{ name: "Piotr Lewandowski",  model: "Wenecja",  score: 45 }, { name: "Joanna Wróbel",      model: "Lazio",    score: 51 }] },
  { label: "Spotkanie",     color: "border-violet-500/40", leads: [{ name: "Tomasz Wiśniewski",  model: "Mediolan", score: 71 }] },
  { label: "Oferta",        color: "border-orange-500/40", leads: [{ name: "Anna Nowak",         model: "Siena",    score: 78 }, { name: "Jakub Szymański",    model: "Siena",    score: 62 }] },
  { label: "Negocjacje",    color: "border-amber-500/40",  leads: [{ name: "Marcin Kowalski",    model: "Wenecja",  score: 92 }] },
  { label: "Wygrany",       color: "border-emerald-500/40",leads: [{ name: "Ewa Kamińska",       model: "Mediolan", score: 97 }] },
];

const FINANCING_CASES = [
  { id: 1, lead: "Magdalena Dąbrowska", model: "Lazio",    status: "wniosek_zlozony",     bank: "PKO BP",    amount: "380 000 zł", deadline: "15.05.2026" },
  { id: 2, lead: "Tomasz Wiśniewski",   model: "Mediolan", status: "w_trakcie_analizy",   bank: "ING Bank",  amount: "450 000 zł", deadline: "20.05.2026" },
  { id: 3, lead: "Anna Nowak",          model: "Siena",    status: "czekam_na_dokumenty",  bank: "Santander", amount: "412 000 zł", deadline: "10.05.2026" },
  { id: 4, lead: "Rafał Maj",           model: "Wenecja",  status: "decyzja_pozytywna",   bank: "mBank",     amount: "320 000 zł", deadline: "01.05.2026" },
  { id: 5, lead: "Zofia Piotrak",       model: "Siena",    status: "nowe",                bank: "—",         amount: "—",          deadline: "—" },
];

const REALIZACJA_PROJECTS = [
  { id: 1, name: "Dom Wenecja — Kowalski",  model: "Wenecja",  location: "Kraków, ul. Polna 12",    status: "w_trakcie",    progress: 65,  team: "Ekipa A", deadline: "15.07.2026" },
  { id: 2, name: "Dom Siena — Kamińska",    model: "Siena",    location: "Gdańsk, ul. Leśna 5",     status: "zakonczone",   progress: 100, team: "Ekipa B", deadline: "20.04.2026" },
  { id: 3, name: "Dom Mediolan — Nowak",    model: "Mediolan", location: "Wrocław, ul. Różana 8",   status: "przygotowanie",progress: 15,  team: "Ekipa C", deadline: "30.09.2026" },
  { id: 4, name: "Dom Verona — Wójcik",     model: "Verona",   location: "Poznań, ul. Słoneczna 3", status: "wstrzymane",   progress: 40,  team: "—",      deadline: "—" },
];

const EKIPY = [
  { id: 1, name: "Ekipa A", leader: "Krzysztof Nowak",    spec: "Konstrukcja + wykończenie", project: "Dom Wenecja — Kowalski", available: false, rating: 4.8, members: 6 },
  { id: 2, name: "Ekipa B", leader: "Marek Zieliński",    spec: "Konstrukcja",               project: "—",                     available: true,  rating: 4.6, members: 4 },
  { id: 3, name: "Ekipa C", leader: "Paweł Wiśniewski",   spec: "Wykończenie + instalacje",  project: "Dom Mediolan — Nowak",  available: false, rating: 4.9, members: 7 },
];

const BANK_MONITOR = [
  { bank: "mBank",       rate: "6.65%", rrso: "6.89%", ltv: 90, max: "900 000 zł", updated: "01.05.2026", alert: true,  alert_msg: "Najlepsza oferta tygodnia" },
  { bank: "ING Bank",   rate: "6.72%", rrso: "6.98%", ltv: 85, max: "800 000 zł", updated: "01.05.2026", alert: true,  alert_msg: "Obniżka o 0.1% od 01.05" },
  { bank: "PKO BP",     rate: "6.85%", rrso: "7.12%", ltv: 80, max: "700 000 zł", updated: "01.05.2026", alert: false, alert_msg: "" },
  { bank: "BNP Paribas",rate: "6.78%", rrso: "7.05%", ltv: 85, max: "750 000 zł", updated: "30.04.2026", alert: false, alert_msg: "" },
  { bank: "Santander",  rate: "6.90%", rrso: "7.20%", ltv: 80, max: "650 000 zł", updated: "30.04.2026", alert: false, alert_msg: "" },
  { bank: "Pekao SA",   rate: "7.05%", rrso: "7.35%", ltv: 75, max: "600 000 zł", updated: "29.04.2026", alert: false, alert_msg: "" },
];

const OFERTY = [
  { id: 1, lead: "Marcin Kowalski",    model: "Wenecja",  value: "485 000 zł", sent: "28.04.2026", status: "odpowiedź",   views: 3, time: "4m 12s" },
  { id: 2, lead: "Anna Nowak",         model: "Siena",    value: "412 000 zł", sent: "29.04.2026", status: "przeczytana", views: 1, time: "2m 05s" },
  { id: 3, lead: "Jakub Szymański",    model: "Siena",    value: "398 000 zł", sent: "30.04.2026", status: "wysłana",     views: 0, time: "—" },
  { id: 4, lead: "Karolina Zając",     model: "Verona",   value: "531 000 zł", sent: "25.04.2026", status: "wygasła",    views: 2, time: "1m 45s" },
  { id: 5, lead: "Rafał Maj",          model: "Mediolan", value: "467 000 zł", sent: "01.05.2026", status: "wysłana",     views: 0, time: "—" },
];

// ── Sidebar ──────────────────────────────────────────────────────────────────

type ActiveView =
  | "Dashboard" | "Leady" | "Zadania" | "Kanban" | "Analytics"
  | "Finansowanie" | "Realizacja" | "Ekipy" | "Monitor Banków" | "Oferty";

const NAV: { group: string; items: { label: string; icon: any; badge?: string }[] }[] = [
  {
    group: "Sprzedaż",
    items: [
      { label: "Dashboard",  icon: LayoutDashboard },
      { label: "Leady",      icon: ListChecks,  badge: "8" },
      { label: "Zadania",    icon: CheckSquare, badge: "3" },
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
      { label: "Powiadomienia", icon: Bell, badge: "2" },
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

const INTERACTIVE: ActiveView[] = [
  "Dashboard", "Leady", "Zadania", "Kanban", "Analytics",
  "Finansowanie", "Realizacja", "Ekipy", "Monitor Banków", "Oferty",
];

function PreviewSidebar({ active, onSelect }: { active: ActiveView; onSelect: (v: ActiveView) => void }) {
  return (
    <div className="w-52 flex-shrink-0 bg-[#070710] border-r border-white/10 flex flex-col overflow-hidden">
      {/* Generic logo — no client name */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00F0FF]/30 to-[#8A2BE2]/30 border border-white/20 flex items-center justify-center flex-shrink-0">
          <Building2 size={14} className="text-[#00F0FF]" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-white">Panel CRM</div>
          <div className="text-[9px] text-gray-500">System zarządzania</div>
        </div>
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

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto py-1 space-y-3">
        {NAV.map(section => (
          <div key={section.group}>
            <div className="px-4 pb-1 text-[9px] text-gray-600 uppercase tracking-[0.15em] font-bold">{section.group}</div>
            <div className="space-y-0.5 px-2">
              {section.items.map(item => {
                const isInteractive = INTERACTIVE.includes(item.label as ActiveView);
                const isActive = active === item.label;
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => isInteractive ? onSelect(item.label as ActiveView) : undefined}
                    className={`relative w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all text-[12px] ${
                      isActive
                        ? "bg-[#00F0FF]/10 text-[#00F0FF] font-semibold"
                        : isInteractive
                        ? "text-gray-400 hover:bg-white/5 hover:text-gray-200 cursor-pointer"
                        : "text-gray-600 cursor-default"
                    }`}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#00F0FF]" />}
                    <Icon size={13} className={isActive ? "text-[#00F0FF]" : ""} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] rounded-full px-1.5 py-0.5 font-bold border ${
                        item.badge && parseInt(item.badge) > 0 && (item.label === "Zadania")
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}>{item.badge}</span>
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
    <div className="p-5 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-white">Dashboard</h2>
        <span className="text-[11px] text-gray-500">01.05.2026</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Leady łącznie",  value: "47",    sub: "+3 dziś",      gradient: "from-[#00F0FF] to-[#8A2BE2]" },
          { label: "Gorące leady",   value: "8",     sub: "priorytet 🔥",  gradient: "from-red-400 to-orange-500" },
          { label: "Zaległe zadania",value: "3",     sub: "wymagają uwagi",gradient: "from-red-500 to-rose-600" },
          { label: "Konwersja",      value: "18.2%", sub: "wygranych/total",gradient: "from-emerald-400 to-teal-500" },
        ].map(m => (
          <div key={m.label} className="bg-[#0A0A12] border border-white/10 rounded-xl p-3.5">
            <div className={`text-2xl font-black bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent`}>{m.value}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{m.label}</div>
            <div className="text-[10px] text-gray-600 mt-1">{m.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-[#0A0A12] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className="text-[#00F0FF]" />
            <span className="text-[12px] font-semibold text-white">Dzisiaj</span>
          </div>
          <div className="space-y-2">
            {[
              { title: "Zadzwoń do Marcina K.",  type: "Telefon",   time: "10:00", overdue: true  },
              { title: "Spotkanie — Tomasz W.",  type: "Spotkanie", time: "13:00", overdue: false },
              { title: "Wyślij wycenę — Jakub S.",type: "Email",   time: "15:00", overdue: false },
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
        <div className="bg-[#0A0A12] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={13} className="text-purple-400" />
            <span className="text-[12px] font-semibold text-white">AI Scoring</span>
          </div>
          <div className="space-y-2">
            {[
              { name: "Marcin Kowalski",    score: 92, label: "Negocjacje — gotowy do umowy",        color: "from-emerald-500 to-teal-500" },
              { name: "Magdalena Dąbrowska",score: 83, label: "Finansowanie — czeka na bank",        color: "from-lime-500 to-green-500" },
              { name: "Anna Nowak",          score: 78, label: "Oferta wysłana — wymagany follow-up", color: "from-amber-500 to-orange-500" },
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
      <div className="bg-[#0A0A12] border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <PieChart size={13} className="text-[#00F0FF]" />
          <span className="text-[12px] font-semibold text-white">Lejek sprzedaży</span>
          <span className="ml-auto text-[10px] text-gray-500">47 leadów łącznie</span>
        </div>
        <div className="space-y-1.5">
          {FUNNEL_STAGES.map(s => (
            <div key={s.label} className="flex items-center gap-2">
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
    <div className="flex flex-col h-full overflow-hidden">
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
                const sc = STATUS_COLORS[lead.status] ?? "";
                const pc = PRIORITY_COLORS[lead.priority] ?? "";
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedId(selectedId === lead.id ? null : lead.id)}
                    className={`border-b border-white/5 cursor-pointer transition-colors ${
                      selectedId === lead.id ? "bg-[#00F0FF]/5" : "hover:bg-white/5"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-semibold text-white">{lead.name}</td>
                    <td className="px-3 py-2.5 text-gray-400 hidden sm:table-cell">{lead.phone}</td>
                    <td className="px-3 py-2.5"><span className="text-[#00F0FF]/80 font-medium">{lead.model}</span></td>
                    <td className="px-3 py-2.5"><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${sc}`}>{STATUS_LABELS[lead.status]}</span></td>
                    <td className="px-3 py-2.5 hidden md:table-cell"><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${pc}`}>{lead.priority === "goracy" ? "🔥 " : ""}{PRIORITY_LABELS[lead.priority]}</span></td>
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 bg-white/10 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${lead.lead_score >= 80 ? "bg-emerald-500" : lead.lead_score >= 60 ? "bg-amber-500" : "bg-slate-500"}`} style={{ width: `${lead.lead_score}%` }} /></div>
                        <span className="text-[10px] text-gray-300 font-bold">{lead.lead_score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 hidden xl:table-cell">{lead.next_step}</td>
                    <td className="px-3 py-2.5 text-gray-500 hidden xl:table-cell">{lead.next_action_date ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {selected && (
          <div className="w-56 flex-shrink-0 border-l border-white/10 bg-[#070710] overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex items-start justify-between">
              <div>
                <div className="text-[12px] font-bold text-white">{selected.name}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{selected.phone}</div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
            </div>
            <div className="p-4 space-y-3">
              <div><div className="text-[10px] text-gray-600 mb-1">Model</div><div className="text-[12px] font-semibold text-[#00F0FF]">{selected.model}</div></div>
              <div><div className="text-[10px] text-gray-600 mb-1">Status</div><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${STATUS_COLORS[selected.status] ?? ""}`}>{STATUS_LABELS[selected.status]}</span></div>
              <div><div className="text-[10px] text-gray-600 mb-1">Priorytet</div><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${PRIORITY_COLORS[selected.priority] ?? ""}`}>{selected.priority === "goracy" ? "🔥 " : ""}{PRIORITY_LABELS[selected.priority]}</span></div>
              <div>
                <div className="text-[10px] text-gray-600 mb-1">AI Score</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-full h-2"><div className={`h-2 rounded-full ${selected.lead_score >= 80 ? "bg-emerald-500" : selected.lead_score >= 60 ? "bg-amber-500" : "bg-slate-500"}`} style={{ width: `${selected.lead_score}%` }} /></div>
                  <span className="text-[11px] font-black text-white">{selected.lead_score}</span>
                </div>
              </div>
              <div><div className="text-[10px] text-gray-600 mb-1">Next step</div><div className="text-[11px] text-gray-300">{selected.next_step}</div></div>
              <div><div className="text-[10px] text-gray-600 mb-1">Termin</div><div className="text-[11px] text-gray-300">{selected.next_action_date ?? "—"}</div></div>
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <button className="w-full flex items-center gap-1.5 text-[11px] text-[#00F0FF]/70 bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded-lg px-3 py-1.5 opacity-60 cursor-not-allowed"><Phone size={11} /> Zadzwoń</button>
                <button className="w-full flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 opacity-60 cursor-not-allowed"><FileText size={11} /> Generuj ofertę</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TasksView() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "overdue">("all");
  const filtered = PREVIEW_TASKS.filter(t => filter === "all" ? true : filter === "overdue" ? t.overdue : !t.overdue);
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-white">Zadania</span>
        <div className="ml-auto flex gap-1">
          {(["all", "upcoming", "overdue"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${filter === f ? "bg-white/10 text-white font-semibold" : "text-gray-500 hover:text-gray-300"}`}>
              {f === "all" ? "Wszystkie" : f === "upcoming" ? "Nadchodzące" : "Zaległe"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.map(task => (
          <div key={task.id} className={`rounded-xl px-4 py-3 border ${ task.overdue ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/10" }`}>
            <div className="flex items-start gap-3">
              {task.overdue ? <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> : <CheckSquare size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className={`text-[12px] font-semibold ${task.overdue ? "text-red-200" : "text-white"}`}>{task.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500">{task.lead}</span>
                  <span className="text-[10px] bg-white/10 rounded px-1.5 py-0.5 text-gray-400">{task.type}</span>
                  {task.overdue && <span className="text-[10px] text-red-400 font-semibold">⚠ Zaległe</span>}
                </div>
              </div>
              <div className={`text-[10px] flex-shrink-0 ${task.overdue ? "text-red-400 font-bold" : "text-gray-500"}`}>{task.due}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanView() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-white">Kanban — Pipeline</span>
        <span className="ml-auto text-[10px] text-gray-500">Kliknij kartę aby zobaczyć szczegóły</span>
      </div>
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-3 h-full" style={{ minWidth: `${KANBAN_COLUMNS.length * 155}px` }}>
          {KANBAN_COLUMNS.map(col => (
            <div key={col.label} className="w-36 flex-shrink-0 flex flex-col">
              <div className={`border-t-2 ${col.color} rounded-t-lg bg-white/5 px-3 py-2 mb-2`}>
                <div className="text-[11px] font-bold text-white">{col.label}</div>
                <div className="text-[10px] text-gray-500">{col.leads.length} leadów</div>
              </div>
              <div className="space-y-2">
                {col.leads.map(lead => (
                  <div key={lead.name} className="bg-[#0A0A12] border border-white/10 rounded-lg p-2.5 hover:border-white/20 transition-colors cursor-pointer">
                    <div className="text-[11px] font-semibold text-white leading-tight">{lead.name}</div>
                    <div className="text-[10px] text-[#00F0FF]/70 mt-1">{lead.model}</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex-1 bg-white/10 rounded-full h-1"><div className={`h-1 rounded-full ${lead.score >= 80 ? "bg-emerald-500" : lead.score >= 60 ? "bg-amber-500" : "bg-slate-500"}`} style={{ width: `${lead.score}%` }} /></div>
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
    <div className="p-5 space-y-4 overflow-y-auto h-full">
      <h2 className="text-[13px] font-bold text-white">Analytics — Raporty sprzedaży</h2>
      <div className="grid grid-cols-3 gap-3">
        {[{ label: "Leady łącznie", value: "47", color: "text-[#00F0FF]" }, { label: "Wygrane", value: "5", color: "text-emerald-400" }, { label: "Konwersja", value: "10.6%", color: "text-amber-400" }].map(m => (
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
            <div key={s.label} className="flex items-center gap-3">
              <div className="text-[10px] text-gray-400 w-28 truncate">{s.label}</div>
              <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden relative">
                <div className={`h-4 rounded-full ${s.color}/60`} style={{ width: `${(s.count / total) * 100}%` }} />
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
          {[{ model: "Wenecja", leads: 14, won: 2 }, { model: "Siena", leads: 11, won: 1 }, { model: "Mediolan", leads: 9, won: 1 }, { model: "Verona", leads: 8, won: 1 }, { model: "Lazio", leads: 5, won: 0 }].map(row => (
            <div key={row.model} className="flex items-center gap-3">
              <div className="text-[11px] text-[#00F0FF]/80 font-semibold w-20">{row.model}</div>
              <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden"><div className="h-3 rounded-full bg-[#8A2BE2]/60" style={{ width: `${(row.leads / 14) * 100}%` }} /></div>
              <div className="text-[10px] text-gray-400 w-16">{row.leads} leadów</div>
              <div className="text-[10px] text-emerald-400 w-16">{row.won} wygr.</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinansowanieView() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-white">Finansowanie hipoteczne</span>
        <span className="ml-1 text-[11px] text-gray-500">({FINANCING_CASES.length} spraw)</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-[#070710]">
            <tr className="border-b border-white/10 text-gray-500 uppercase text-[10px]">
              <th className="px-4 py-2.5 text-left">Klient</th>
              <th className="px-3 py-2.5 text-left">Model</th>
              <th className="px-3 py-2.5 text-left">Status finansowania</th>
              <th className="px-3 py-2.5 text-left hidden md:table-cell">Bank</th>
              <th className="px-3 py-2.5 text-left hidden lg:table-cell">Kwota kredytu</th>
              <th className="px-3 py-2.5 text-left hidden lg:table-cell">Termin</th>
            </tr>
          </thead>
          <tbody>
            {FINANCING_CASES.map(c => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-semibold text-white">{c.lead}</td>
                <td className="px-3 py-3"><span className="text-[#00F0FF]/80 font-medium">{c.model}</span></td>
                <td className="px-3 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${FIN_STATUS_COLORS[c.status] ?? ""}`}>{FIN_STATUS_LABELS[c.status]}</span></td>
                <td className="px-3 py-3 text-gray-300 hidden md:table-cell">{c.bank}</td>
                <td className="px-3 py-3 text-gray-300 hidden lg:table-cell font-semibold">{c.amount}</td>
                <td className="px-3 py-3 text-gray-500 hidden lg:table-cell">{c.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-white/10 flex gap-2 flex-shrink-0">
        {Object.entries(FIN_STATUS_LABELS).slice(0, 4).map(([k, v]) => (
          <span key={k} className={`text-[10px] px-2 py-1 rounded-full border ${FIN_STATUS_COLORS[k]}`}>{v}</span>
        ))}
      </div>
    </div>
  );
}

function RealizacjaView() {
  const statusMap: Record<string, { label: string; color: string }> = {
    w_trakcie:     { label: "W trakcie",     color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    zakonczone:    { label: "Zakończone",    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    przygotowanie: { label: "Przygotowanie", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    wstrzymane:    { label: "Wstrzymane",    color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  };
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-white">Realizacja projektów</span>
        <span className="ml-1 text-[11px] text-gray-500">({REALIZACJA_PROJECTS.length} projektów)</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {REALIZACJA_PROJECTS.map(p => {
          const st = statusMap[p.status];
          return (
            <div key={p.id} className="bg-[#0A0A12] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-[12px] font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{p.location}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${st.color}`}>{st.label}</span>
                  <span className="text-[10px] text-[#00F0FF]/70 font-semibold">{p.model}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500">Postęp</span>
                    <span className="text-[10px] font-bold text-white">{p.progress}%</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2">
                    <div className={`h-2 rounded-full ${ p.progress === 100 ? "bg-emerald-500" : p.progress > 50 ? "bg-blue-500" : p.progress > 0 ? "bg-amber-500" : "bg-slate-600" }`} style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 flex-shrink-0">Ekipa: <span className="text-gray-300">{p.team}</span></div>
                <div className="text-[10px] text-gray-500 flex-shrink-0">Termin: <span className="text-gray-300">{p.deadline}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EkipyView() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-white">Ekipy budowlane</span>
        <span className="ml-1 text-[11px] text-gray-500">({EKIPY.length} ekipy)</span>
        <button className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1 hover:bg-emerald-500/20 transition-colors">
          <Plus size={11} /> Dodaj ekipę
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {EKIPY.map(e => (
          <div key={e.id} className="bg-[#0A0A12] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#8A2BE2]/15 border border-[#8A2BE2]/30 flex items-center justify-center">
                  <span className="text-[11px] font-black text-purple-300">{e.name.split(" ")[1]}</span>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-white">{e.name}</div>
                  <div className="text-[10px] text-gray-500">Lider: {e.leader}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${ e.available ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30" }`}>
                  {e.available ? "Dostępna" : "Zajęta"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div><div className="text-[10px] text-gray-600 mb-0.5">Specjalizacja</div><div className="text-gray-300">{e.spec}</div></div>
              <div><div className="text-[10px] text-gray-600 mb-0.5">Aktualny projekt</div><div className="text-gray-300 truncate">{e.project}</div></div>
              <div className="flex flex-col items-end">
                <div className="text-[10px] text-gray-600 mb-0.5">Ocena / Skład</div>
                <div className="flex items-center gap-1">
                  <StarIcon size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 font-bold">{e.rating}</span>
                  <span className="text-gray-500 ml-1">{e.members} os.</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonitorBankowView() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-white">Monitor Banków</span>
        <span className="ml-auto text-[10px] text-gray-500">Aktualizacja: 01.05.2026</span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-[#070710]">
            <tr className="border-b border-white/10 text-gray-500 uppercase text-[10px]">
              <th className="px-4 py-2.5 text-left">Bank</th>
              <th className="px-3 py-2.5 text-left">Oprocentowanie</th>
              <th className="px-3 py-2.5 text-left hidden sm:table-cell">RRSO</th>
              <th className="px-3 py-2.5 text-left hidden md:table-cell">LTV max</th>
              <th className="px-3 py-2.5 text-left hidden lg:table-cell">Max kwota</th>
              <th className="px-3 py-2.5 text-left">Alert</th>
            </tr>
          </thead>
          <tbody>
            {BANK_MONITOR.map((b, i) => (
              <tr key={b.bank} className={`border-b border-white/5 transition-colors ${ b.alert ? "hover:bg-amber-500/5 cursor-pointer" : "hover:bg-white/5" }`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                      <span className="text-[8px] font-black text-gray-300">{b.bank.slice(0,2).toUpperCase()}</span>
                    </div>
                    <span className="font-semibold text-white">{b.bank}</span>
                    {i === 0 && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-1.5 py-0.5 font-bold">BEST</span>}
                  </div>
                </td>
                <td className="px-3 py-3 font-bold text-[#00F0FF]">{b.rate}</td>
                <td className="px-3 py-3 text-gray-300 hidden sm:table-cell">{b.rrso}</td>
                <td className="px-3 py-3 text-gray-300 hidden md:table-cell">{b.ltv}%</td>
                <td className="px-3 py-3 text-gray-300 hidden lg:table-cell">{b.max}</td>
                <td className="px-3 py-3">
                  {b.alert
                    ? <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /><span className="text-[10px] text-amber-400 font-medium">{b.alert_msg}</span></div>
                    : <span className="text-[10px] text-gray-600">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-white/10 flex-shrink-0">
        <p className="text-[10px] text-gray-600">System automatycznie powiadamia o zmianach oprocentowania o więcej niż 0.1%. Dane pobierane co 24h.</p>
      </div>
    </div>
  );
}

function OfertyView() {
  const statusStyle: Record<string, string> = {
    wysłana:     "bg-blue-500/20 text-blue-400 border-blue-500/30",
    przeczytana: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "odpowiedź": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    wygasła:     "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-white">Oferty PDF</span>
        <span className="ml-1 text-[11px] text-gray-500">— śledzenie otwarć</span>
        <button className="ml-auto flex items-center gap-1.5 text-[11px] text-[#00F0FF]/80 bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded-lg px-2.5 py-1 hover:bg-[#00F0FF]/10 transition-colors">
          <Plus size={11} /> Nowa oferta
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-[#070710]">
            <tr className="border-b border-white/10 text-gray-500 uppercase text-[10px]">
              <th className="px-4 py-2.5 text-left">Klient</th>
              <th className="px-3 py-2.5 text-left">Model</th>
              <th className="px-3 py-2.5 text-left hidden md:table-cell">Wartość</th>
              <th className="px-3 py-2.5 text-left">Status</th>
              <th className="px-3 py-2.5 text-left hidden sm:table-cell">Wysłano</th>
              <th className="px-3 py-2.5 text-left hidden lg:table-cell">Otwarcia</th>
              <th className="px-3 py-2.5 text-left hidden lg:table-cell">Czas na str.</th>
            </tr>
          </thead>
          <tbody>
            {OFERTY.map(o => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-semibold text-white">{o.lead}</td>
                <td className="px-3 py-3"><span className="text-[#00F0FF]/80 font-medium">{o.model}</span></td>
                <td className="px-3 py-3 text-gray-300 font-semibold hidden md:table-cell">{o.value}</td>
                <td className="px-3 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${statusStyle[o.status] ?? ""}`}>{o.status}</span></td>
                <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">{o.sent}</td>
                <td className="px-3 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Eye size={10} className="text-gray-500" />
                    <span className={o.views > 0 ? "text-white font-bold" : "text-gray-600"}>{o.views}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-gray-400 hidden lg:table-cell">{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── CRM Preview shell ─────────────────────────────────────────────────────────

function DomCRMPreview() {
  const [active, setActive] = useState<ActiveView>("Dashboard");
  const topTabs: ActiveView[] = ["Dashboard", "Leady", "Zadania", "Kanban", "Analytics"];

  return (
    <div className="bg-[#030305] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
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
            app.twoj-crm.pl · Panel CRM
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {topTabs.map(t => (
            <button key={t} onClick={() => setActive(t)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${active === t ? "bg-white/15 text-white font-semibold" : "text-gray-500 hover:text-gray-300"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: "560px" }}>
        <PreviewSidebar active={active} onSelect={setActive} />
        <div className="flex-1 bg-[#040408] overflow-hidden">
          {active === "Dashboard"      && <DashboardView />}
          {active === "Leady"          && <LeadsView />}
          {active === "Zadania"        && <TasksView />}
          {active === "Kanban"         && <KanbanView />}
          {active === "Analytics"      && <AnalyticsView />}
          {active === "Finansowanie"   && <FinansowanieView />}
          {active === "Realizacja"     && <RealizacjaView />}
          {active === "Ekipy"          && <EkipyView />}
          {active === "Monitor Banków" && <MonitorBankowView />}
          {active === "Oferty"         && <OfertyView />}
        </div>
      </div>
    </div>
  );
}

// ── Integrations ──────────────────────────────────────────────────────────────

const INTEGRATION_GROUPS = [
  { title: "API & Techniczne", icon: Code, accent: "#00F0FF", items: [
    { name: "REST API",  desc: "Pełna integracja przez HTTP/JSON — własne aplikacje, ERP, bazy danych, dowolne zewnętrzne systemy." },
    { name: "Webhooks",  desc: "Real-time eventy przy każdej akcji — nowy lead, zmiana statusu, wygrany deal, zadanie zaległe." },
    { name: "GraphQL",   desc: "Elastyczne zapytania dla zaawansowanych integracji i raportowania danych w czasie rzeczywistym." },
  ]},
  { title: "Automatyzacje no-code", icon: Zap, accent: "#F59E0B", items: [
    { name: "Zapier",   desc: "Połącz z 6000+ aplikacjami bez kodu — Gmail, Google Sheets, Trello, Notion i tysiące innych." },
    { name: "Make.com", desc: "Zaawansowane scenariusze z warunkami, pętlami i transformacjami danych bez ograniczeń." },
    { name: "n8n",      desc: "Open-source automation z własnym hostingiem — pełna kontrola nad przepływami bez abonamentów." },
  ]},
  { title: "Komunikacja & Email", icon: Mail, accent: "#A855F7", items: [
    { name: "Email SMTP/IMAP",       desc: "Dwukierunkowa synchronizacja — cała korespondencja widoczna w profilu leada." },
    { name: "WhatsApp Business API", desc: "Wysyłaj i odbieraj wiadomości WhatsApp bezpośrednio z karty klienta w CRM." },
    { name: "SMS via Twilio",        desc: "Automatyczne i ręczne SMS z szablonami, harmonogramem i śledzeniem dostarczenia." },
  ]},
  { title: "Marketing & Lead Gen", icon: TrendingUp, accent: "#10B981", items: [
    { name: "Facebook Lead Ads",  desc: "Leady z kampanii Meta trafiają do CRM w czasie rzeczywistym z auto-przypisaniem handlowca." },
    { name: "Google Ads / Forms", desc: "Importuj leady z formularzy Google i śledź ROI każdej kampanii w dashboardzie CRM." },
    { name: "Formularz embed",    desc: "Wstaw formularz na stronę — każde zgłoszenie to automatycznie nowy lead z tracking UTM." },
  ]},
  { title: "Workspace & Powiadomienia", icon: Bell, accent: "#6366F1", items: [
    { name: "Google Workspace", desc: "Synchronizacja z Gmail, Google Calendar i Drive — spotkania i email zsynchronizowane z CRM." },
    { name: "Slack",            desc: "Powiadomienia o leadach, statusach i zadaniach zaległych bezpośrednio na kanale Slack." },
    { name: "Microsoft 365",    desc: "Integracja z Outlook, Teams i OneDrive dla firm działających w ekosystemie Microsoft." },
  ]},
  { title: "Bazy danych & Storage", icon: Database, accent: "#EF4444", items: [
    { name: "PostgreSQL / MySQL", desc: "Import historycznych danych klientów i synchronizacja dwustronna z własną bazą." },
    { name: "Google Sheets",      desc: "Eksportuj raporty i synchronizuj dane z arkuszami — dostępne dla całego zespołu." },
    { name: "S3 / R2 Storage",    desc: "Dokumenty, oferty i pliki klientów w chmurze — dostęp z poziomu karty leada." },
  ]},
];

const FEATURES = [
  { icon: ListChecks, title: "16-etapowy pipeline",           desc: "Od Do przypisania do Wygranego — każdy lead ma precyzyjny status, historię i właściciela." },
  { icon: Brain,      title: "AI Scoring leadów",             desc: "Automatyczna ocena szansy zamknięcia — system wskazuje, komu zadzwonić w pierwszej kolejności." },
  { icon: Banknote,   title: "Moduł finansowania",            desc: "Śledzenie wniosków kredytowych, decyzji banku i dokumentów finansowych klienta — w jednym miejscu." },
  { icon: Landmark,   title: "Monitor banków",                desc: "Bieżące oferty kredytowe i porównanie oprocentowania banków z automatycznym alertem zmian." },
  { icon: HardHat,    title: "Realizacja i ekipy budowlane", desc: "Zarządzanie projektami budowlanymi, zleceniami dla ekip, harmonogramem i postępem prac." },
  { icon: Building2,  title: "Katalog modeli domów",         desc: "Wenecja, Siena, Mediolan, Verona, Lazio — wyceny, konfigurator i generator ofert PDF." },
  { icon: Users,      title: "Multi-role & team",            desc: "Admin, manager, handlowiec, finansowanie, realizacja, ekipa — każda rola widzi to, co powinna." },
  { icon: BarChart3,  title: "Analytics w czasie rzeczywistym",desc: "Konwersja wg modelu, handlowca, kampanii — wykresy i raporty eksportowalne do PDF/Excel." },
  { icon: Wrench,     title: "Własna instancja",              desc: "Twoje dane na Twoim serwerze. Zero ograniczeń od liczby użytkowników, zero abonamentu od siedzenia." },
];

const PIPELINE_STATUSES = [
  { label: "Nowy",           color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { label: "Do kontaktu",    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { label: "Skontaktowany",  color: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  { label: "Spotkanie",      color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  { label: "Wycena",         color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  { label: "Oferta wysłana", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { label: "Follow-up",      color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { label: "Negocjacje",     color: "bg-amber-600/20 text-amber-300 border-amber-600/30" },
  { label: "Przyg. umowy",   color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { label: "Finansowanie",   color: "bg-lime-500/20 text-lime-300 border-lime-500/30" },
  { label: "Wygrany",        color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SkaloraCRMPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030305] text-white">
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
            <button onClick={() => setDemoOpen(true)} className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block">Zobacz demo</button>
            <Link to="/#contact" className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Zamów wdrożenie</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-full px-4 py-1.5 text-sm text-[#00F0FF] mb-6">
            <Star size={13} /> Dedykowany CRM SaaS — budownictwo, OZE, deweloperzy
          </div>
          <h1 className="font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter mb-6 leading-tight">
            CRM dla firm,{" "}
            <span className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">które budują</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            16-etapowy pipeline, AI scoring leadów, moduł finansowania hipotecznego,
            monitor banków, zarządzanie ekipami budowlanymi i integracja z 20+ narzędziami —
            wszystko w jednym systemie na Twoim serwerze.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button onClick={() => setDemoOpen(true)} className="group flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-bold px-8 py-4 rounded-full hover:opacity-90 transition-all hover:scale-105 text-lg">
              Wypróbuj demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/#contact" className="flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full hover:border-white/40 transition-colors text-lg">Zamów wdrożenie</Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            {["Wdrożenie w 48h", "Własna instancja", "16 etapów pipeline", "AI Scoring", "Monitor banków", "Bez limitu użytkowników"].map(t => (
              <span key={t} className="flex items-center gap-1.5"><Check size={13} className="text-[#00F0FF]" /> {t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Interaktywny podgląd — kliknij moduły w sidebarze lub zakładki u góry
            </div>
          </div>
          <DomCRMPreview />
          <p className="text-center text-sm text-gray-600 mt-4">
            <span className="text-gray-500">Dashboard · Leady · Zadania · Kanban · Analytics · Finansowanie · Realizacja · Ekipy · Monitor Banków · Oferty</span>
          </p>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 text-purple-300 rounded-full px-4 py-2 mb-4">
              <Layers size={13} /> Ekosystem integracji
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mb-4">
              Łączy się z wszystkim,{" "}<span className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">czego używasz</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">REST API, Webhooks, Zapier, Make.com, Gmail, WhatsApp, Facebook Ads, Slack i więcej.</p>
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
            <p className="text-gray-400 text-sm mb-5 max-w-xl mx-auto">Masz własny ERP, CMS, albo system rozliczeniowy? Wdrożymy dedykowaną integrację przez REST API lub Webhook.</p>
            <Link to="/#contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black text-sm font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
              Porozmawiajmy o integracji <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

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
              { icon: Flame,  title: "Priorytet gorący",   desc: "System oznacza leady wymagające natychmiastowej akcji na podstawie daty i statusu.",          color: "text-red-400" },
              { icon: Brain,  title: "AI Score 0–100",     desc: "Każdy lead dostaje ocenę szansy zamknięcia — algorytm uwzględnia aktywność, terminy i historię.", color: "text-purple-400" },
              { icon: Target, title: "Kontrola procesu",  desc: "Manager widzi w czasie rzeczywistym które leady stoją w miejscu i które wymagają interwencji.", color: "text-[#00F0FF]" },
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

      {demoOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A10] border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <span className="font-bold text-white">Demo — Panel CRM</span>
                <p className="text-xs text-gray-400 mt-0.5">Przykładowe dane, możesz swobodnie eksplorować wszystkie moduły</p>
              </div>
              <button onClick={() => setDemoOpen(false)} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DomCRMPreview />
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-gray-400 text-sm">Chcesz taki system dla swojej firmy?</p>
              <Link to="/#contact" onClick={() => setDemoOpen(false)} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-bold px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity text-sm">
                Zamów wdrożenie <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
