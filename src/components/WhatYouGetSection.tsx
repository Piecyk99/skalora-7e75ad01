import useScrollReveal from "../hooks/useScrollReveal";

const DELIVERABLES = [
  { n: "01", title: "Strategia komunikacji i oferty", desc: "Wiesz, co, do kogo i dlaczego. Pozycjonowanie, propozycja wartości i komunikat sprzedażowy — dopracowane i gotowe do wdrożenia.", accent: "#00F0FF" },
  { n: "02", title: "Treści i materiały wideo", desc: "Content zaprojektowany pod cel biznesowy, nie pod zasięg. Każda treść prowadzi do następnego kroku w procesie pozyskiwania klienta.", accent: "#63B3ED" },
  { n: "03", title: "Strona lub landing page", desc: "Nie wizytówka — narzędzie sprzedaży. Jasny cel konwersji, CTA dopasowane do etapu klienta i szybkie ładowanie na każdym urządzeniu.", accent: "#A855F7" },
  { n: "04", title: "Formularz i struktura kontaktu", desc: "Każde zapytanie trafia we właściwe miejsce, w odpowiednim momencie i z odpowiednim kontekstem do dalszej obsługi.", accent: "#6B8AFF" },
  { n: "05", title: "Lejek sprzedażowy", desc: "Zautomatyzowana droga od pierwszego kontaktu do decyzji zakupowej — z sekwencją mailową i kwalifikacją leada w tle.", accent: "#00F0FF" },
  { n: "06", title: "CRM i obsługa leada", desc: "Porządek w procesie sprzedaży: historia kontaktu, statusy, notatki, zadania. Żaden klient nie przepada przez brak organizacji.", accent: "#63B3ED" },
  { n: "07", title: "Automatyzacje", desc: "Follow-up, potwierdzenia, powiadomienia i sekwencje — działają bez Twojej ręcznej pracy, 24 godziny na dobę.", accent: "#A855F7" },
  { n: "08", title: "Plan i wdrożenie krok po kroku", desc: "Nie dostaniesz prezentacji do samodzielnej realizacji. Budujemy razem — z pełną dokumentacją i Twoim udziałem na każdym etapie.", accent: "#6B8AFF" },
];

export default function WhatYouGetSection() {
  const ref = useScrollReveal();

  return (
    <section id="what-you-get" data-testid="what-you-get-section" className="py-20 sm:py-28 bg-skalora-bg" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="overline reveal mb-4">Co dostajesz</div>
          <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-5">
            Co dokładnie{" "}<span className="gradient-text">dostajesz w praktyce</span>
          </h2>
          <p className="reveal text-base text-zinc-400 max-w-2xl mx-auto font-manrope">Konkretne elementy systemu, które budujemy razem — każdy z jasnym efektem biznesowym. Żadnych ogólnikowych „strategii" oderwanych od wdrożenia.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DELIVERABLES.map((d, i) => (
            <div key={i} data-testid={`deliverable-card-${i}`} className={`reveal reveal-delay-${(i % 4) + 1} gradient-border p-6 flex flex-col group card-hover`} style={{ background: "#070710" }}>
              <div className="font-outfit font-black text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block" style={{ background: `linear-gradient(135deg, ${d.accent}, #8A2BE2)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{d.n}</div>
              <h3 className="font-outfit font-bold text-white text-base mb-3 leading-snug">{d.title}</h3>
              <p className="text-zinc-400 font-manrope text-sm leading-relaxed flex-1">{d.desc}</p>
            </div>
          ))}
        </div>

        <div className="reveal mt-10 text-center">
          <p className="text-zinc-500 font-manrope text-sm">Nie każda współpraca obejmuje wszystkie elementy. Na konsultacji ustalamy, co ma największy sens dla Twojego biznesu i od czego zaczynamy.</p>
        </div>
      </div>
    </section>
  );
}
