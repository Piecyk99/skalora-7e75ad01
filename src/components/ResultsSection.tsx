import { Users, Eye, Award, Clock, Repeat, ShoppingBag, BookOpen, Zap, LucideIcon } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";

interface Result {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
}

const RESULTS: Result[] = [
  { icon: Users, title: "Więcej leadów każdego miesiąca", desc: "Przewidywalny, stały napływ potencjalnych klientów — niezależnie od poleceń.", accent: "#00F0FF" },
  { icon: Eye, title: "Wyższy autorytet i rozpoznawalność", desc: "Twoja marka wygląda premium. Klienci trafiają z nastawieniem do zakupu.", accent: "#8A2BE2" },
  { icon: Award, title: "Silna pozycja eksperta", desc: "Treści budują Cię jako lidera branży. Zanim zadzwonią, już Ci ufają.", accent: "#00F0FF" },
  { icon: Clock, title: "Oszczędność czasu", desc: "Automatyzacje i awatar AI przejmują żmudną pracę. Ty skupiasz się na biznesie.", accent: "#8A2BE2" },
  { icon: Repeat, title: "Regularność bez wysiłku", desc: "System działa ciągle — nawet kiedy Ty nie pracujesz. Brak przerw, brak chaosu.", accent: "#00F0FF" },
  { icon: ShoppingBag, title: "Sprzedaż przez lejki", desc: "Zautomatyzowany lejek prowadzi klienta od pierwszego kontaktu do decyzji zakupowej.", accent: "#8A2BE2" },
  { icon: BookOpen, title: "Zarabianie na wiedzy", desc: "Kurs online lub produkt cyfrowy, który generuje przychód — skalowalnie.", accent: "#00F0FF" },
  { icon: Zap, title: "Kompletny system, który skaluje", desc: "Wszystkie elementy działają razem — wzmacniając się wzajemnie i napędzając Twój wzrost.", accent: "#8A2BE2" },
];

export default function ResultsSection() {
  const ref = useScrollReveal();

  return (
    <section id="results" data-testid="results-section" className="py-28 sm:py-36" style={{ background: "linear-gradient(180deg, #030305 0%, #060610 50%, #030305 100%)" }} ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <div className="overline reveal mb-4">Czego możesz się spodziewać</div>
          <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-6">
            Co SKALORA{" "}<span className="gradient-text">zmienia w Twojej firmie</span>
          </h2>
          <p className="reveal text-lg text-zinc-400 max-w-2xl mx-auto font-manrope">Nie obiecujemy konkretnych liczb — każda firma startuje z innego miejsca. Obiecujemy za to konkretną zmianę w tym, jak działa Twój marketing i jak trafiają do Ciebie klienci.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {RESULTS.map((r, i) => {
            const Icon = r.icon;
            const rgba = r.accent === "#00F0FF" ? "0,240,255" : "138,43,226";
            return (
              <div key={i} data-testid={`result-card-${i}`} className={`reveal reveal-delay-${(i % 4) + 1} gradient-border p-6 card-hover group`} style={{ background: "#070710" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300" style={{ background: `rgba(${rgba},0.1)`, border: `1px solid rgba(${rgba},0.2)` }}>
                  <Icon size={22} style={{ color: r.accent }} />
                </div>
                <h3 className="font-outfit font-bold text-white text-base mb-2 leading-snug">{r.title}</h3>
                <p className="text-zinc-500 font-manrope text-sm leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
