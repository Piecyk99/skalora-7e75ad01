import { Eye, Zap, DollarSign, ArrowRight, Check, LucideIcon } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";

interface Pillar {
  number: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  services: string[];
  effect: string;
  accent: string;
}

const PILLARS: Pillar[] = [
  { number: "01", icon: Eye, title: "Przyciąganie uwagi", subtitle: "Regularny napływ potencjalnych klientów — bez polegania wyłącznie na poleceniach", services: ["Strategia komunikacji i pozycjonowanie oferty", "Social media: TikTok, Instagram, LinkedIn", "Short video, reels i plan contentowy", "AI Avatar — treści bez codziennego nagrywania", "Budowanie pozycji eksperta i autorytetu"], effect: "Efekt: Właściwi ludzie dowiadują się o Tobie regularnie i trafiają na stronę gotowi do rozmowy.", accent: "#00F0FF" },
  { number: "02", icon: Zap, title: "Konwersja i pozyskiwanie leadów", subtitle: "Każdy odwiedzający ma realną szansę zostać klientem", services: ["Strona firmowa lub landing page pod konkretny cel", "CTA, formularze i automatyczna kwalifikacja leadów", "Lejek sprzedażowy od reklamy do kontaktu", "Kampanie Meta i Google — ruch pod wyniki", "Email marketing i sekwencje follow-up"], effect: "Efekt: Strona i lejek pracują całą dobę — zapytania napływają, nawet gdy nie siedzisz przy komputerze.", accent: "#6B8AFF" },
  { number: "03", icon: DollarSign, title: "Domykanie i skalowanie", subtitle: "Porządek w leadach, przewidywalny przychód, wzrost bez chaosu", services: ["CRM i obsługa leada od pierwszego kontaktu", "Automatyczny follow-up i kwalifikacja zapytań", "Materiały sprzedażowe i oferty", "Kurs online lub produkt cyfrowy", "Automatyzacja sprzedaży i onboardingu klienta"], effect: "Efekt: Żaden lead nie przepada. Wiedza i usługi zamieniają się w przychód niezależny od Twojego czasu.", accent: "#8A2BE2" },
];

const rgbaFromAccent = (accent: string) => accent === "#00F0FF" ? "0,240,255" : accent === "#6B8AFF" ? "107,138,255" : "138,43,226";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function SolutionsSection() {
  const ref = useScrollReveal();

  return (
    <section id="solutions" data-testid="solutions-section" className="py-20 sm:py-28 bg-skalora-bg" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="overline reveal mb-4">System SKALORA</div>
          <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-5">
            Nie usługi.{" "}<span className="gradient-text">Trzy filary systemu.</span>
          </h2>
          <p className="reveal text-base text-zinc-400 max-w-2xl mx-auto font-manrope">Każdy filar rozwiązuje konkretny problem biznesowy. Razem tworzą system, który pozyskuje klientów, konwertuje zapytania i skaluje przychody.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mb-10">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            const rgba = rgbaFromAccent(p.accent);
            return (
              <div key={i} data-testid={`pillar-card-${i}`} className={`reveal reveal-delay-${i + 1} gradient-border p-7 flex flex-col group card-hover`} style={{ background: "#070710" }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: `rgba(${rgba},0.1)`, border: `1px solid rgba(${rgba},0.2)` }}>
                    <Icon size={22} style={{ color: p.accent }} />
                  </div>
                  <span className="font-outfit font-black text-3xl leading-none" style={{ color: p.accent, opacity: 0.2 }}>{p.number}</span>
                </div>
                <h3 className="font-outfit font-bold text-white text-xl mb-2 leading-snug">{p.title}</h3>
                <p className="text-zinc-400 font-manrope text-sm leading-relaxed mb-5">{p.subtitle}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {p.services.map((s, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: p.accent }} />
                      <span className="text-zinc-400 font-manrope text-sm">{s}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-5 border-t border-white/5 text-xs font-manrope font-semibold leading-relaxed" style={{ color: p.accent }}>{p.effect}</div>
              </div>
            );
          })}
        </div>

        <div className="reveal text-center">
          <button data-testid="solutions-cta" onClick={() => scrollTo("contact")} className="group bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-manrope font-semibold px-8 py-4 rounded-full shadow-[0_0_30px_rgba(0,240,255,0.2)] hover:shadow-[0_0_50px_rgba(138,43,226,0.4)] hover:scale-105 transition-all duration-300 inline-flex items-center gap-2">
            Umów konsultację
            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
