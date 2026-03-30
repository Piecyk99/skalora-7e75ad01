import { Check, X, Bot, ArrowRight } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";

const WITHOUT = [
  "Brak czasu na regularne nagrywanie",
  "Nieregularne lub rzadkie publikacje",
  "Chaos produkcyjny — nie wiesz, co nagrać",
  "Odkładanie wideo na później bez końca",
  "Niewidoczna marka w sieci",
];

const WITH = [
  "Regularne treści wideo bez studia i kamery",
  "Stała obecność online — nawet 12 filmów/mies.",
  "Gotowe skrypty i plany contentowe",
  "Awatar 4K odwzorowujący Twój wygląd i głos",
  "Spójna marka budowana automatycznie",
];

const FEATURES = [
  { title: "Realistyczny awatar 4K", desc: "Odwzorowuje Twój wygląd, mimikę i styl wypowiedzi z niespotykaną dokładnością." },
  { title: "Klonowanie głosu i tonu", desc: "AI uczy się Twojego sposobu mówienia. Widz nie odróżni awatara od Ciebie." },
  { title: "Pełna kontrola i bezpieczeństwo", desc: "Awatar tworzony wyłącznie na podstawie materiałów dostarczonych przez Ciebie i za Twoją pełną zgodą." },
  { title: "Skalowalny content bez wysiłku", desc: "Raz się nagrywasz — AI produkuje dziesiątki materiałów. Ty akceptujesz, system publikuje." },
];

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function AIAvatarSection() {
  const ref = useScrollReveal();

  return (
    <section id="ai-avatar" data-testid="ai-avatar-section" className="py-20 sm:py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #030305 0%, #060610 50%, #030305 100%)" }} ref={ref}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(138,43,226,0.07) 0%, transparent 65%)", animation: "pulse-glow 6s ease-in-out infinite" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="reveal text-center mb-4">
          <span className="inline-flex items-center gap-2 text-xs font-manrope font-bold uppercase tracking-widest px-4 py-2 rounded-full" style={{ background: "rgba(138,43,226,0.1)", border: "1px solid rgba(138,43,226,0.3)", color: "#b57dff" }}>
            <Bot size={14} />
            Technologia AI Premium — wyróżnik SKALORA
          </span>
        </div>

        <div className="reveal text-center mb-12">
          <h2 className="font-outfit font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-5">
            Twoja marka. Twoją twarzą.{" "}<span className="gradient-text">Bez studia.</span>
          </h2>
          <p className="text-base text-zinc-400 max-w-2xl mx-auto font-manrope">Tworzymy realistyczny awatar AI, który odwzorowuje Twój wygląd, głos i styl komunikacji. Regularny content — bez konieczności stawania przed kamerą.</p>
        </div>

        <div className="reveal grid md:grid-cols-2 gap-4 mb-12 max-w-3xl mx-auto">
          <div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <div className="flex items-center gap-2 mb-4">
              <X size={16} className="text-red-400" />
              <span className="text-sm font-outfit font-bold text-red-400 uppercase tracking-widest">Bez systemu</span>
            </div>
            <ul className="space-y-2.5">
              {WITHOUT.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <X size={13} className="text-red-400/60 mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-500 font-manrope text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "rgba(138,43,226,0.06)", border: "1px solid rgba(138,43,226,0.2)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Check size={16} className="text-purple-400" />
              <span className="text-sm font-outfit font-bold text-purple-400 uppercase tracking-widest">Z awatarem AI</span>
            </div>
            <ul className="space-y-2.5">
              {WITH.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check size={13} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-300 font-manrope text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {FEATURES.map((f, i) => (
            <div key={i} data-testid={`ai-feature-${i}`} className={`reveal reveal-delay-${i + 1} gradient-border p-5 group card-hover`} style={{ background: "#070710" }}>
              <div className="w-2 h-2 rounded-full mb-4" style={{ background: "linear-gradient(135deg,#8A2BE2,#00F0FF)" }} />
              <h3 className="font-outfit font-bold text-white text-sm mb-2 leading-snug">{f.title}</h3>
              <p className="text-zinc-400 font-manrope text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="reveal text-center">
          <button data-testid="ai-avatar-cta" onClick={() => scrollTo("contact")} className="group inline-flex items-center gap-2 font-manrope font-semibold text-white px-8 py-4 rounded-full transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg,rgba(138,43,226,0.8) 0%,rgba(0,240,255,0.5) 100%)", boxShadow: "0 0 30px rgba(138,43,226,0.25)" }}>
            Umów konsultację
            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 text-xs text-zinc-600 font-manrope">Materiały tworzone na podstawie Twoich materiałów i wyłącznie za Twoją zgodą.</p>
        </div>
      </div>
    </section>
  );
}
