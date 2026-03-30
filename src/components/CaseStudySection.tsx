import { ArrowRight } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";

const ADVANTAGES = [
  { n: "01", title: "Pełna uwaga — nie obsługa z szablonu", desc: "Na tym etapie każdy projekt jest dla nas najważniejszy. Twój system budujemy od podstaw, z pełnym zaangażowaniem — nie wrzucamy Cię na taśmę produkcyjną.", accent: "#00F0FF" },
  { n: "02", title: "Bezpośredni kontakt z twórcami", desc: "Nie pracujesz z junior account managerem, który przekazuje zlecenia dalej. Masz kontakt z osobami, które faktycznie projektują, piszą i wdrażają.", accent: "#6B8AFF" },
  { n: "03", title: "Elastyczność, której nie ma w dużych agencjach", desc: "Możemy dostosować zakres, tempo i priorytety do Twojej rzeczywistej sytuacji — bez korporacyjnych procedur, bez czekania na akceptacje piętra wyżej.", accent: "#A855F7" },
];

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function CaseStudySection() {
  const ref = useScrollReveal();

  return (
    <section id="case-studies" data-testid="case-study-section" className="py-20 sm:py-28 bg-skalora-bg" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="overline reveal mb-4">Uczciwie o nas</div>
            <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl tracking-tighter text-white mb-5">
              Startujemy —{" "}<span className="gradient-text">i to jest właśnie dobry moment.</span>
            </h2>
            <p className="reveal text-base text-zinc-400 font-manrope leading-relaxed mb-6">
              Nie mamy jeszcze długiej listy klientów. Mamy za to coś, co duże agencje dawno straciły: <strong className="text-zinc-200">pełne skupienie na Twoim projekcie</strong>, bezpośredni kontakt i przestrzeń, żeby zbudować coś realnego — nie zaliczyć kolejne zlecenie.
            </p>
            <p className="reveal text-base text-zinc-500 font-manrope leading-relaxed mb-8">
              Każdą współpracę traktujemy jako projekt referencyjny, który budujemy z myślą o tym, żeby mówił za nas. Dlatego zależy nam na Twoim wyniku bardziej niż na szybkim rozliczeniu.
            </p>
            <button data-testid="case-study-cta" onClick={() => scrollTo("contact")} className="reveal flex items-center gap-2 font-outfit font-bold text-sm px-6 py-3 rounded-full transition-all duration-300 hover:gap-4" style={{ background: "linear-gradient(135deg, #00F0FF 0%, #8A2BE2 100%)", color: "#030305" }}>
              Umów konsultację <ArrowRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {ADVANTAGES.map((a, i) => (
              <div key={i} data-testid={`advantage-card-${i}`} className={`reveal reveal-delay-${i + 1} gradient-border p-6 group card-hover`} style={{ background: "#070710" }}>
                <div className="flex items-start gap-4">
                  <div className="font-outfit font-black text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${a.accent}, #8A2BE2)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{a.n}</div>
                  <div>
                    <h3 className="font-outfit font-bold text-white text-base mb-2 leading-snug">{a.title}</h3>
                    <p className="text-zinc-400 font-manrope text-sm leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
