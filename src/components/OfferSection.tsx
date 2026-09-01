import { ArrowRight, Check, Megaphone, Handshake, Layers } from "lucide-react";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const CARDS = [
  {
    icon: Megaphone,
    title: "Reklamy + wdrożenie CRM",
    desc: "Prowadzimy kampanie Meta/Google i wdrażamy kompletny CRM/ERP dopasowany do Waszego procesu.",
    points: ["Leady, pipeline, oferty PDF, realizacja, ekipy", "Automatyzacje i kampanie z trackingiem", "Aplikacja mobilna dla zespołu w terenie"],
  },
  {
    icon: Handshake,
    title: "Płacisz 1/3 ceny",
    desc: "Wdrożenie za ułamek standardowej ceny, resztę rozliczamy współpracą i leadami kredytowymi.",
    points: ["Niski koszt wejścia", "Model barterowy / partnerski", "Rozliczenie dopasowane do Waszego modelu"],
  },
  {
    icon: Layers,
    title: "Wszystko w jednym systemie",
    desc: "Sprzedaż → finansowanie → projekt → realizacja → montaż → rozliczenie, bez chaosu i wielu narzędzi.",
    points: ["Specjalizacja: sprzedaż domów szkieletowych i modułowych", "Działamy też w innych branżach", "Jedno źródło prawdy dla całego zespołu"],
  },
];

export default function OfferSection() {
  return (
    <section id="oferta" className="relative bg-skalora-bg py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 65%)" }} />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="overline mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-cyan-400" /> Jak współpracujemy
          </div>
          <h2 className="font-outfit font-black text-4xl sm:text-5xl tracking-tighter leading-tight text-white mb-5">
            Wdrożenie CRM <span className="gradient-text">za 1/3 ceny</span>, w zamian za leady kredytowe i współpracę
          </h2>
          <p className="text-lg text-zinc-300 font-manrope">
            Reklamy + CRM + automatyzacje w jednym systemie. Niski koszt wejścia, bo część rozliczamy
            wartością, którą wspólnie generujemy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {CARDS.map((c, i) => (
            <div key={i} className="glass rounded-2xl p-7 border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(138,43,226,0.15))", border: "1px solid rgba(0,240,255,0.25)" }}>
                <c.icon size={22} className="text-cyan-400" />
              </div>
              <h3 className="font-outfit font-bold text-xl text-white mb-2">{c.title}</h3>
              <p className="text-sm text-zinc-400 font-manrope mb-5 leading-relaxed">{c.desc}</p>
              <ul className="space-y-2.5">
                {c.points.map((p, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check size={15} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300 font-manrope">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => scrollTo("contact")} className="group bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-manrope font-semibold px-8 py-4 rounded-full shadow-[0_0_30px_rgba(0,240,255,0.25)] hover:shadow-[0_0_50px_rgba(138,43,226,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-2">
            Umów konsultację <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <a href="https://crm.skalora.pl/demo.html" target="_blank" rel="noreferrer" className="text-white border border-white/15 hover:border-cyan-500/40 hover:bg-white/5 font-manrope font-semibold px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-sm">
            Zobacz demo CRM →
          </a>
        </div>
      </div>
    </section>
  );
}
