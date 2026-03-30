import { Search, Layers, Rocket, TrendingUp, LucideIcon } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
}

const STEPS: Step[] = [
  { number: "01", icon: Search, title: "Analiza i Strategia", desc: "Zaczynamy od dogłębnej analizy Twojej firmy, pozycji na rynku i grupy docelowej. Budujemy strategię wzrostu dopasowaną do Twoich celów i zasobów.", accent: "#00F0FF" },
  { number: "02", icon: Layers, title: "Budowa Systemu", desc: "Projektujemy i budujemy cały ekosystem: stronę, lejek sprzedażowy, system contentowy, automatyzacje i awatara AI — jako jeden spójny mechanizm.", accent: "#4FC3F7" },
  { number: "03", icon: Rocket, title: "Produkcja i Wdrożenie", desc: "Tworzymy wszystkie materiały: wideo, grafiki, teksty, reklamy. Wdrażamy system i uruchamiamy kampanie. Wszystko spójne, przemyślane i gotowe na skalę.", accent: "#9C64FA" },
  { number: "04", icon: TrendingUp, title: "Optymalizacja i Wzrost", desc: "Analizujemy dane, optymalizujemy to, co przynosi wyniki, i skalujemy skuteczne kanały. System stale się doskonali — Ty widzisz rosnące wyniki.", accent: "#8A2BE2" },
];

const rgbaFromAccent = (accent: string) => {
  if (accent === "#00F0FF") return "0,240,255";
  if (accent === "#8A2BE2") return "138,43,226";
  if (accent === "#4FC3F7") return "79,195,247";
  return "156,100,250";
};

export default function ProcessSection() {
  const ref = useScrollReveal();

  return (
    <section id="process" data-testid="process-section" className="py-28 sm:py-36 bg-skalora-bg" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <div className="overline reveal mb-4">Jak działamy</div>
          <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-6">
            Prosta droga od{" "}<span className="gradient-text">problemu do wyników</span>
          </h2>
          <p className="reveal text-lg text-zinc-400 max-w-2xl mx-auto font-manrope">Jasny, sprawdzony proces — bez chaosu, bez zgadywania. Wiesz, co się dzieje na każdym etapie.</p>
        </div>

        <div className="relative grid md:grid-cols-4 gap-8 md:gap-0">
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.3), rgba(138,43,226,0.3), transparent)" }} />
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const rgba = rgbaFromAccent(step.accent);
            return (
              <div key={i} data-testid={`process-step-${i}`} className={`reveal reveal-delay-${i + 1} relative flex flex-col items-center text-center px-4`}>
                <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: `radial-gradient(circle, rgba(${rgba},0.15) 0%, transparent 70%)`, border: `1px solid rgba(${rgba},0.25)`, boxShadow: `0 0 30px rgba(${rgba},0.1)` }}>
                  <Icon size={28} style={{ color: step.accent }} />
                </div>
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 text-[10px] font-outfit font-black tracking-widest" style={{ color: step.accent, opacity: 0.6 }}>{step.number}</div>
                <h3 className="font-outfit font-bold text-white text-lg mb-3">{step.title}</h3>
                <p className="text-zinc-500 font-manrope text-sm leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
