import { useState } from "react";
import { ChevronDown } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";

const FAQS = [
  { q: "Od czego zaczyna się współpraca?", a: "Od bezpłatnej konsultacji diagnostycznej. Omawiamy Twoją firmę, aktualną sytuację i miejsca, w których dziś uciekają klienci. Na tej podstawie przygotowujemy konkretny plan działania, nie szablonową ofertę." },
  { q: "Ile trwa start i kiedy widać pierwsze efekty?", a: "Pierwsze elementy systemu wdrażamy w ciągu 2-3 tygodni od startu. Kompletny system budujemy przez 4-8 tygodni. Pierwsze zapytania pojawiają się zazwyczaj wraz z uruchomieniem strony lub kampanii." },
  { q: "Czy muszę mieć już stronę internetową?", a: "Nie. Możemy zbudować stronę lub landing page od podstaw. Jeśli masz już stronę, podczas konsultacji ocenimy, czy warto ją poprawić, czy zbudować osobną stronę pod konkretny cel konwersyjny." },
  { q: "Czy mogę tworzyć content bez ciągłego nagrywania?", a: "Tak. Awatar AI pozwala produkować realistyczne materiały wideo bez stawania przed kamerą każdego dnia. Raz się nagrywasz, AI produkuje kolejne materiały na podstawie napisanego scenariusza. Ty akceptujesz gotowe treści." },
  { q: "Czy zajmujecie się tylko marketingiem, czy też procesem sprzedaży?", a: "Zajmujemy się całym procesem, od przyciągnięcia uwagi po obsługę zapytania. CRM, follow-up, kwalifikacja leadów, to też jest nasz obszar. Marketing bez sprawnego procesu sprzedaży nie ma sensu." },
  { q: "Czy to ma sens dla firmy usługowej?", a: "Tak, to właśnie nasz główny profil klienta. Najlepiej działamy z firmami, w których wartość jednego klienta jest istotna i zależy Ci na jakości zapytań, nie tylko ich liczbie." },
  { q: "Jak działa awatar AI?", a: "Na podstawie dostarczonych nagrań tworzymy cyfrowy awatar odwzorowujący Twój wygląd, mimikę i sposób mówienia. Każdy materiał powstaje za Twoją pełną zgodą i akceptacją. Efekt jest na tyle realistyczny, że widz nie odróżni awatara od oryginału." },
  { q: "Co jeśli mam teraz chaos i brak jakiegokolwiek systemu?", a: "To właśnie jest nasza specjalność. Najlepsze efekty osiągamy z firmami, które mają potencjał, ale brakuje im porządku i systemu. Diagnozujemy, projektujemy i wdrażamy, krok po kroku, bez chaosu." },
  { q: "Czy to rozwiązanie jest tylko dla marek osobistych?", a: 'Nie. Pracujemy z firmami usługowymi, ekspertami, konsultantami, agencjami i markami osobistymi. Kluczowe jest, że chcesz zbudować system, który realnie wspiera wzrost, nie tylko "być w social mediach".' },
  { q: "Co jeśli mam już klientów, ale chcę ich więcej?", a: "Idealna sytuacja. Oznacza to, że Twoja oferta działa, potrzebujesz systemu, który będzie ją skalować. Audytujemy obecny proces i projektujemy rozwiązanie, które zwiększy liczbę zapytań bez proporcjonalnego wzrostu czasu pracy." },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useScrollReveal();

  return (
    <section id="faq" data-testid="faq-section" className="py-20 sm:py-28 bg-skalora-bg" ref={ref}>
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-12">
          <div className="overline reveal mb-4">FAQ</div>
          <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl tracking-tighter text-white mb-5">
            Najczęstsze{" "}<span className="gradient-text">pytania</span>
          </h2>
          <p className="reveal text-base text-zinc-400 font-manrope">Nie znalazłeś odpowiedzi? Napisz do nas, odpowiemy w ciągu 24 godzin.</p>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, i) => (
            <div key={i} data-testid={`faq-item-${i}`} className={`reveal reveal-delay-${(i % 4) + 1} gradient-border overflow-hidden transition-all duration-200`} style={{ background: "#070710" }}>
              <button data-testid={`faq-trigger-${i}`} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-outfit font-semibold text-white text-base leading-snug">{faq.q}</span>
                <ChevronDown size={18} className="flex-shrink-0 text-zinc-500 transition-transform duration-300" style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              {open === i && (
                <div data-testid={`faq-answer-${i}`} className="px-6 pb-5">
                  <p className="text-zinc-400 font-manrope text-sm leading-relaxed border-t border-white/5 pt-4">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
