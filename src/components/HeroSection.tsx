import { ArrowRight, ChevronDown, Check } from "lucide-react";

const BULLETS = [
  "Strategia, content i sprzedaż w jednym systemie",
  "Strona i lejek zaprojektowane pod leady",
  "Więcej porządku, lepsza konwersja, szybsza reakcja",
];

const METRICS = [
  { label: "System pozyskiwania", value: "360°" },
  { label: "Czas na wyniki", value: "<90 dni" },
  { label: "Model pracy", value: "Strategia + egzekucja" },
];

const TAGS = ["AI Avatar", "Lejki", "Social Media", "Strony", "Kursy", "Automatyzacje"];

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function HeroSection() {
  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative min-h-screen flex items-center overflow-hidden bg-skalora-bg"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-48 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 65%)", animation: "float-orb 9s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-24 -right-48 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(138,43,226,0.1) 0%, transparent 65%)", animation: "float-orb 11s ease-in-out infinite reverse" }}
        />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.25), transparent)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20 grid lg:grid-cols-2 gap-14 items-center w-full">
        <div>
          <div data-testid="hero-overline" className="overline mb-5 flex items-center gap-3">
            <span className="w-8 h-px bg-cyan-400" />
            Agencja Growth Premium
          </div>

          <h1 data-testid="hero-headline" className="font-outfit font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[1.05] mb-5 text-white">
            Budujemy systemy,{" "}
            <span className="gradient-text">które zamieniają</span>{" "}
            uwagę w klientów.
          </h1>

          <p data-testid="hero-subheadline" className="text-lg text-zinc-300 leading-relaxed mb-6 max-w-xl font-manrope">
            Łączymy komunikację, treści, stronę internetową, lejek sprzedażowy i obsługę
            leada w jeden system, który pomaga firmom zdobywać więcej klientów i rosnąć
            bez chaosu.
          </p>

          <ul className="space-y-2.5 mb-8">
            {BULLETS.map((b, i) => (
              <li key={i} data-testid={`hero-bullet-${i}`} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(0,240,255,0.12)", border: "1px solid rgba(0,240,255,0.3)" }}
                >
                  <Check size={11} className="text-cyan-400" />
                </div>
                <span className="text-zinc-300 text-sm font-manrope">{b}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              data-testid="hero-cta-primary"
              onClick={() => scrollTo("contact")}
              className="group bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-manrope font-semibold px-8 py-4 rounded-full shadow-[0_0_30px_rgba(0,240,255,0.25)] hover:shadow-[0_0_50px_rgba(138,43,226,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Umów konsultację
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button
              data-testid="hero-cta-secondary"
              onClick={() => scrollTo("process")}
              className="text-white border border-white/15 hover:border-cyan-500/40 hover:bg-white/5 font-manrope font-semibold px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              Zobacz, jak działa współpraca
            </button>
          </div>

          <p className="text-xs text-zinc-600 font-manrope">
            Bezpłatna konsultacja &middot; Bez zobowiązań &middot; Odpowiedź w 24h
          </p>
        </div>

        <div data-testid="hero-visual" className="hidden lg:block relative">
          <div className="glass rounded-2xl p-6 relative overflow-hidden" style={{ boxShadow: "0 0 60px rgba(0,240,255,0.06), 0 40px 80px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs text-zinc-500 mb-1 font-manrope uppercase tracking-widest">System Pozyskiwania</div>
                <div className="text-white font-outfit font-bold text-xl">Dashboard SKALORA</div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs text-cyan-400 font-manrope">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {METRICS.map((m, i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="text-xl font-outfit font-bold mb-1" style={{ background: "linear-gradient(135deg,#00F0FF,#8A2BE2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{m.value}</div>
                  <div className="text-xs text-zinc-400 font-manrope leading-tight">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {TAGS.map((tag, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full font-manrope" style={{
                  background: i % 2 === 0 ? "rgba(0,240,255,0.06)" : "rgba(138,43,226,0.06)",
                  border: `1px solid ${i % 2 === 0 ? "rgba(0,240,255,0.18)" : "rgba(138,43,226,0.18)"}`,
                  color: i % 2 === 0 ? "rgba(0,240,255,0.85)" : "rgba(180,140,255,0.85)",
                }}>{tag}</span>
              ))}
            </div>

            <div className="space-y-3">
              {[{ label: "Pozyskiwanie uwagi", pct: 78 }, { label: "Konwersja lejka", pct: 64 }, { label: "System AI", pct: 93 }].map((bar, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-manrope">
                    <span>{bar.label}</span>
                    <span>{bar.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${bar.pct}%`, background: "linear-gradient(90deg, #00F0FF, #8A2BE2)", boxShadow: "0 0 8px rgba(0,240,255,0.4)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -top-6 -right-6 glass rounded-xl px-4 py-3 border border-white/10 z-10" style={{ animation: "float-card 5s ease-in-out infinite" }}>
            <div className="text-xs text-zinc-400 mb-0.5 font-manrope">Nowy lead</div>
            <div className="text-sm text-white font-outfit font-bold">+3 dzisiaj</div>
            <div className="text-xs text-cyan-400 mt-0.5 font-manrope">Konsultant B2B</div>
          </div>

          <div className="absolute -bottom-4 -left-6 glass rounded-xl px-4 py-3 border border-white/10 z-10" style={{ animation: "float-card 7s ease-in-out infinite reverse" }}>
            <div className="text-xs text-zinc-400 mb-0.5 font-manrope">Awatar AI</div>
            <div className="text-sm text-white font-outfit font-bold">Aktywny</div>
            <div className="text-xs text-purple-400 mt-0.5 font-manrope">12 filmów/mies.</div>
          </div>
        </div>
      </div>

      <button data-testid="hero-scroll-down" onClick={() => scrollTo("trust")} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600 hover:text-zinc-400 transition-colors animate-bounce" aria-label="Przewiń niżej">
        <ChevronDown size={28} />
      </button>
    </section>
  );
}
