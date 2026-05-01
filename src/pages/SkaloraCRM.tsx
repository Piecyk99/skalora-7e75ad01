import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, BarChart3, Users, FileText, Bell, Search, ChevronDown, Star, Zap, Shield, Globe } from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Pipeline leadów",
    desc: "Śledź każdego klienta od pierwszego kontaktu do zamkniętej sprzedaży. Statusy, notatki, historia — wszystko w jednym miejscu.",
  },
  {
    icon: BarChart3,
    title: "Analityka w czasie rzeczywistym",
    desc: "Dashboard z konwersją, liczbą leadów dziennie, tygodniowo. Wiesz dokładnie gdzie jesteś.",
  },
  {
    icon: FileText,
    title: "Notatki i historia",
    desc: "Każdy kontakt z klientem zapisany. Wróć do rozmowy po tygodniu i wiesz dokładnie co ustaliliście.",
  },
  {
    icon: Bell,
    title: "Dla każdej branży",
    desc: "Budownictwo, OZE, usługi, e-commerce — CRM dostosowany do Twojego procesu sprzedaży.",
  },
  {
    icon: Zap,
    title: "Gotowy w 24h",
    desc: "Wdrożenie bez IT, bez miesiący konfiguracji. Zaczynasz dodawać klientów następnego dnia.",
  },
  {
    icon: Shield,
    title: "Twoje dane, Twój system",
    desc: "Własna instancja, własna baza danych. Żadnych ograniczeń licencyjnych od liczby użytkowników.",
  },
];

const STATUSES = [
  { label: "Nowy", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { label: "Kontakt", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { label: "Zakwalifikowany", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { label: "Oferta", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { label: "Wygrany", color: "bg-green-500/20 text-green-300 border-green-500/30" },
];

const SAMPLE_LEADS = [
  { name: "Anna Kowalska", email: "anna@firma.pl", phone: "+48 600 100 200", stage: "Skaluję biznes", status: "Wygrany" },
  { name: "Piotr Nowak", email: "p.nowak@budexpl.pl", phone: "+48 500 200 300", stage: "Rozwijam się", status: "Oferta" },
  { name: "Magdalena Wiśniewska", email: "m.wisn@oze.pl", phone: "+48 700 300 400", stage: "Dopiero zaczynam", status: "Kontakt" },
  { name: "Tomasz Zając", email: "t.zajac@uslugi.pl", phone: "+48 510 400 500", stage: "Skaluję biznes", status: "Zakwalifikowany" },
];

const STATUS_COLORS: Record<string, string> = {
  "Wygrany": "bg-green-500/20 text-green-300 border-green-500/30",
  "Oferta": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Kontakt": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Zakwalifikowany": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Nowy": "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function SkaloraCRMPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030305]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-bold text-xl bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
              SKALORA
            </span>
            <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <Link
                to="/"
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-md transition-colors"
              >
                Agencja
              </Link>
              <span className="px-3 py-1.5 text-sm text-white bg-white/10 rounded-md font-medium">
                CRM
              </span>
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

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-full px-4 py-1.5 text-sm text-[#00F0FF] mb-6">
            <Star size={14} />
            CRM dla każdej branży — wdrożenie w 24h
          </div>
          <h1 className="font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter mb-6">
            Zarządzaj klientami{" "}
            <span className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
              inteligentnie
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            SKALORA CRM to gotowy system do prowadzenia leadów, historii kontaktów i analizy sprzedaży.
            Twoja instancja, Twoje dane — bez abonamentów od liczby użytkowników.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#0A0A10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Mock header */}
            <div className="bg-[#070710] border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
                  SKALORA CRM
                </span>
                <div className="flex gap-1">
                  {["Przegląd", "Leady"].map((t, i) => (
                    <span key={t} className={`px-3 py-1 rounded-lg text-xs ${i === 0 ? "bg-white/10 text-white" : "text-gray-400"}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-500">Panel wewnętrzny</span>
            </div>

            {/* Mock stats */}
            <div className="p-6 grid grid-cols-3 gap-4 border-b border-white/5">
              {[
                { label: "Wszystkie leady", value: "24", gradient: "from-[#00F0FF] to-[#8A2BE2]" },
                { label: "Dzisiaj", value: "3", gradient: "from-green-400 to-emerald-600" },
                { label: "Wygrane", value: "8", gradient: "from-yellow-400 to-orange-500" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-4">
                  <div className={`text-2xl font-bold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
                    {s.value}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Mock leads table */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white">Ostatnie leady</span>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 text-xs text-gray-400">
                  <Search size={12} />
                  Szukaj...
                </div>
              </div>
              <div className="space-y-2">
                {SAMPLE_LEADS.map((lead) => (
                  <div key={lead.name} className="flex items-center justify-between bg-white/5 hover:bg-white/8 rounded-lg px-4 py-3 transition-colors cursor-pointer">
                    <div>
                      <div className="text-sm text-white font-medium">{lead.name}</div>
                      <div className="text-xs text-gray-400">{lead.email}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[lead.status]}`}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            ↑ Podgląd panelu CRM —{" "}
            <button onClick={() => setDemoOpen(true)} className="text-[#00F0FF] hover:underline">
              kliknij żeby wypróbować demo
            </button>
          </p>
        </div>
      </section>

      {/* Features */}
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
                <f.icon size={24} className="text-[#00F0FF] mb-3" />
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
            <p className="text-gray-400">5 statusów — wiesz dokładnie na jakim etapie jest każdy klient.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {STATUSES.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-full border text-sm font-medium ${s.color}`}>
                  {s.label}
                </span>
                {i < STATUSES.length - 1 && <ArrowRight size={16} className="text-gray-600" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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

      {/* Footer */}
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
                <Link
                  to="/demo"
                  className="text-sm text-[#00F0FF] hover:underline"
                  onClick={() => setDemoOpen(false)}
                >
                  Otwórz pełne demo →
                </Link>
                <button onClick={() => setDemoOpen(false)} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Wszystkie leady", value: "24", color: "from-[#00F0FF] to-[#8A2BE2]" },
                  { label: "Dzisiaj", value: "3", color: "from-green-400 to-emerald-600" },
                  { label: "Wygrane", value: "8", color: "from-yellow-400 to-orange-500" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center">
                    <div className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Leads */}
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Leady (24)</span>
                </div>
                <div className="divide-y divide-white/5">
                  {SAMPLE_LEADS.map((lead) => (
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
