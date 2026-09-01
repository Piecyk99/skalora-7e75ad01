import { Target, TrendingDown, Globe, DollarSign, LucideIcon } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";

interface Problem {
  number: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  hint: string;
  accent: string;
}

const PROBLEMS: Problem[] = [
  { number: "01", icon: Target, title: "Brak przewidywalnych leadów", desc: "Zależysz od poleceń i szczęścia, a nie od systemu. Nie wiesz, skąd przyjdzie kolejny klient, ani kiedy.", hint: "Budujemy lejek, który generuje zapytania co miesiąc.", accent: "#00F0FF" },
  { number: "02", icon: TrendingDown, title: "Treści nie prowadzą do sprzedaży", desc: "Posty wychodzą, polubienia są, ale nikt nie pisze ani nie kupuje. Content bez strategii to tylko koszt, czasu i energii.", hint: "Tworzymy treści zaprojektowane pod uwagę, leady i pozycję.", accent: "#8A2BE2" },
  { number: "03", icon: Globe, title: "Strona nie konwertuje odwiedzin", desc: "Odwiedzający przychodzą i wychodzą bez żadnego działania. Strona nie buduje zaufania i nie ma celu konwersyjnego.", hint: "Projektujemy strony, które prowadzą do kontaktu.", accent: "#00F0FF" },
  { number: "04", icon: DollarSign, title: "Brak systemu monetyzacji", desc: "Masz wiedzę, klientów i doświadczenie, ale nie masz systemu, który zamienia to w przewidywalny, skalowalny przychód.", hint: "Budujemy lejki, kursy i automatyzacje, które zarabiają.", accent: "#8A2BE2" },
];

const rgbaFromAccent = (accent: string) => accent === "#00F0FF" ? "0,240,255" : "138,43,226";

export default function ProblemsSection() {
  const ref = useScrollReveal();

  return (
    <section id="problems" data-testid="problems-section" className="py-20 sm:py-28 bg-skalora-bg" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="overline reveal mb-4">Diagnoza</div>
          <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-5">
            Dlaczego Twoja firma{" "}<span className="gradient-text">nie rośnie</span>{" "}tak szybko, jak powinna?
          </h2>
          <p className="reveal text-base text-zinc-400 max-w-2xl mx-auto font-manrope">Cztery fundamentalne problemy, które blokują wzrost większości firm usługowych i marek osobistych.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon;
            const rgba = rgbaFromAccent(p.accent);
            return (
              <div key={i} data-testid={`problem-card-${i}`} className={`reveal reveal-delay-${i + 1} gradient-border p-7 group card-hover`} style={{ background: "#070710" }}>
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: `rgba(${rgba},0.1)`, border: `1px solid rgba(${rgba},0.2)` }}>
                      <Icon size={22} style={{ color: p.accent }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-outfit font-black tracking-widest mb-2 opacity-50" style={{ color: p.accent }}>{p.number}</div>
                    <h3 className="font-outfit font-bold text-white text-xl mb-3 leading-snug">{p.title}</h3>
                    <p className="text-zinc-400 font-manrope text-sm leading-relaxed mb-4">{p.desc}</p>
                    <div className="text-xs font-manrope font-semibold pt-4 border-t border-white/5" style={{ color: p.accent }}>{p.hint}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
