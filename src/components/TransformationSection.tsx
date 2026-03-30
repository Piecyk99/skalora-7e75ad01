import { ArrowRight } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";

const TRANSFORMATIONS = [
  {
    label: "Firma usługowa",
    before: { title: "Ruch bez zapytań", items: ["Strona wygląda dobrze, ale nikt nie pisze", "Odwiedzający wychodzą bez żadnego działania", "Brak jasnego CTA i celu konwersyjnego", "Marketing bez mierzalnego efektu sprzedażowego"] },
    after: { title: "System pozyskiwania leadów", items: ["Komunikat dopasowany do klienta docelowego", "Strona docelowa z formularzem i follow-up", "Każde zapytanie trafia do CRM i jest obsłużone", "Regularny napływ rozmów kwalifikacyjnych"] },
    effect: "Efekt: Przewidywalny napływ zapytań i porządek w procesie obsługi klientów",
    accent: "#00F0FF",
  },
  {
    label: "Ekspert / konsultant",
    before: { title: "Widoczność bez sprzedaży", items: ["Treści wychodzą, zasięgi rosną — zapytań brak", "Brak systemu prowadzącego od treści do kontaktu", "Zapytania pojawiają się przypadkowo i nikt ich nie obsługuje", "Każdy klient pochodzi wyłącznie z polecenia"] },
    after: { title: "Treści, które generują zapytania", items: ["Content plan zbudowany pod cel biznesowy", "Strona i CTA prowadzące do rezerwacji konsultacji", "Automatyczny follow-up po każdym zapytaniu", "Silna pozycja eksperta — klienci trafiają gotowi"] },
    effect: "Efekt: Lepsza jakość leadów, więcej zapytań i ugruntowana pozycja eksperta",
    accent: "#6B8AFF",
  },
  {
    label: "Marka osobista / edukator",
    before: { title: "Brak czasu i regularności", items: ["Nagrywanie zajmuje zbyt dużo czasu", "Publikacje nieregularne — lub ich brak", "Wiedza nie zamienia się w stały przychód", "Brak lejka — brak skalowalnych zarobków"] },
    after: { title: "Skalowalny system contentowy", items: ["AI Avatar produkuje treści bez codziennego nagrywania", "Regularna obecność — do 12 materiałów miesięcznie", "Lejek sprzedażowy od treści do zakupu", "Kurs lub produkt cyfrowy generuje dochód niezależnie"] },
    effect: "Efekt: Regularna obecność i skala działań bez konieczności codziennego nagrywania",
    accent: "#8A2BE2",
  },
];

const rgbaFromAccent = (accent: string) => accent === "#00F0FF" ? "0,240,255" : accent === "#6B8AFF" ? "107,138,255" : "138,43,226";

export default function TransformationSection() {
  const ref = useScrollReveal();

  return (
    <section id="transformation" data-testid="transformation-section" className="py-20 sm:py-28 bg-skalora-bg" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="overline reveal mb-4">Modele wdrożeń SKALORA</div>
          <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl tracking-tighter text-white mb-5">
            Jak wygląda wdrożenie{" "}<span className="gradient-text">w praktyce</span>
          </h2>
          <p className="reveal text-base text-zinc-400 max-w-2xl mx-auto font-manrope">Trzy realne scenariusze — od stanu obecnego do systemu, który generuje zapytania i porządkuje obsługę klientów.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TRANSFORMATIONS.map((t, i) => {
            const rgba = rgbaFromAccent(t.accent);
            return (
              <div key={i} data-testid={`transformation-card-${i}`} className={`reveal reveal-delay-${i + 1} gradient-border p-6 flex flex-col group card-hover`} style={{ background: "#070710" }}>
                <div className="text-xs font-manrope font-bold uppercase tracking-widest mb-5 pb-4 border-b border-white/5" style={{ color: t.accent }}>{t.label}</div>
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>✕</div>
                      <span className="text-xs font-outfit font-bold uppercase tracking-wider text-zinc-500">Przed</span>
                      <span className="text-xs font-manrope text-zinc-500 ml-1">— {t.before.title}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {t.before.items.map((item, j) => (
                        <li key={j} className="text-xs text-zinc-600 font-manrope flex items-start gap-2">
                          <span className="text-red-500/40 mt-0.5">—</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-center py-1">
                    <div className="flex-1 h-px" style={{ background: `rgba(${rgba},0.2)` }} />
                    <ArrowRight size={16} className="mx-3" style={{ color: t.accent }} />
                    <div className="flex-1 h-px" style={{ background: `rgba(${rgba},0.2)` }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `rgba(${rgba},0.12)`, color: t.accent }}>✓</div>
                      <span className="text-xs font-outfit font-bold uppercase tracking-wider" style={{ color: t.accent }}>Po</span>
                      <span className="text-xs font-manrope text-zinc-400 ml-1">— {t.after.title}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {t.after.items.map((item, j) => (
                        <li key={j} className="text-xs text-zinc-300 font-manrope flex items-start gap-2">
                          <span className="mt-0.5 flex-shrink-0" style={{ color: t.accent }}>+</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/5 text-xs font-manrope font-semibold leading-relaxed" style={{ color: t.accent }}>{t.effect}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
