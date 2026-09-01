import { Shield, Target, Wrench, ArrowRight, TrendingUp, LucideIcon } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";

interface Reason {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
}

const REASONS: Reason[] = [
  { icon: Target, title: "Jeden system, nie zbiór działań", desc: "Nie prowadzimy social mediów osobno, strony osobno i reklam osobno. Projektujemy i budujemy całą ścieżkę, od pierwszego kontaktu do zamkniętej sprzedaży, jako jeden spójny mechanizm.", accent: "#00F0FF" },
  { icon: TrendingUp, title: "Patrzymy na wynik, nie na estetykę", desc: "Każda decyzja projektowa, contentowa i techniczna jest podejmowana z myślą o jednym: ile zapytań to wygeneruje. Nie, czy dobrze wygląda na Instagramie. Miernikiem sukcesu jest lead, nie zasięg.", accent: "#6B8AFF" },
  { icon: Wrench, title: "Wdrażamy, nie tylko rekomendujemy", desc: "Nie dostajesz strategii w PDF do samodzielnej realizacji. Budujemy razem, od planu przez produkcję po uruchomienie i optymalizację. Jesteśmy przy tym na każdym etapie.", accent: "#A855F7" },
  { icon: Shield, title: "Porządkujemy cały proces sprzedaży", desc: "Zajmujemy się nie tylko tym, jak pozyskać lead, ale też jak go właściwie obsłużyć. CRM, follow-up, kwalifikacja, domknięcie, to też jest nasz obszar pracy.", accent: "#00F0FF" },
  { icon: ArrowRight, title: "Budujemy pod skalę", desc: "To, co tworzymy, ma działać nie tylko dziś, ale rosnąć razem z Tobą. System contentowy, automatyzacje i lejek zaprojektowane z myślą o przyszłości, nie jednorazowy sprint.", accent: "#6B8AFF" },
];

const rgbaFromAccent = (accent: string) => accent === "#00F0FF" ? "0,240,255" : accent === "#6B8AFF" ? "107,138,255" : "168,85,247";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function WhySKALORASection() {
  const ref = useScrollReveal();

  return (
    <section id="why-skalora" data-testid="why-skalora-section" className="py-20 sm:py-28 bg-skalora-bg" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="overline reveal mb-4">Dlaczego SKALORA</div>
          <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-5">
            Nie jesteśmy kolejną{" "}<span className="gradient-text">agencją social media.</span>
          </h2>
          <p className="reveal text-base text-zinc-400 max-w-2xl mx-auto font-manrope">Pracujemy inaczej niż większość agencji. Oto konkretne powody, dla których nasi klienci wybierają partnerstwo, nie kolejnego wykonawcę postów.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REASONS.map((r, i) => {
            const Icon = r.icon;
            const rgba = rgbaFromAccent(r.accent);
            return (
              <div key={i} data-testid={`why-reason-${i}`} className={`reveal reveal-delay-${(i % 3) + 1} gradient-border p-7 flex flex-col group card-hover`} style={{ background: "#070710" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300" style={{ background: `rgba(${rgba},0.1)`, border: `1px solid rgba(${rgba},0.2)` }}>
                  <Icon size={22} style={{ color: r.accent }} />
                </div>
                <h3 className="font-outfit font-bold text-white text-lg mb-3">{r.title}</h3>
                <p className="text-zinc-400 font-manrope text-sm leading-relaxed flex-1">{r.desc}</p>
              </div>
            );
          })}

          <div data-testid="why-cta-card" className="reveal reveal-delay-3 gradient-border p-7 flex flex-col items-center justify-center text-center cursor-pointer card-hover group" style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.04) 0%, rgba(138,43,226,0.04) 100%)" }} onClick={() => scrollTo("contact")}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: "linear-gradient(135deg, #00F0FF 0%, #8A2BE2 100%)" }}>
              <ArrowRight size={22} className="text-[#030305]" />
            </div>
            <h3 className="font-outfit font-bold text-white text-base mb-2">Sprawdź to w praktyce</h3>
            <p className="text-zinc-400 font-manrope text-sm">Umów bezpłatną konsultację i sprawdź, co konkretnie możemy zbudować razem.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
