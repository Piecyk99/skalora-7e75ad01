import useScrollReveal from "../hooks/useScrollReveal";

const STRIPS = [
  { label: "Projektujemy systemy pod leady i wyniki — nie pod pozory działania" },
  { label: "Pracujemy z firmami, które traktują wzrost poważnie" },
  { label: "Stawiamy na wdrożenie i mierzalny efekt — nie pliki PDF ze strategią" },
];

const SECTORS = [
  "Domy modułowe", "Budownictwo", "Deweloperzy", "Wykończenia",
  "Nieruchomości", "Usługi B2B", "Firmy lokalne",
];

export default function TrustSection() {
  const ref = useScrollReveal();

  return (
    <section id="trust" data-testid="trust-section" className="py-12 bg-skalora-bg border-y border-white/5 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 mb-10">
          {STRIPS.map((s, i) => (
            <div key={i} data-testid={`trust-strip-${i}`} className="flex items-center gap-3 group">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i % 2 === 0 ? "#00F0FF" : "#8A2BE2" }} />
              <span className="text-sm font-manrope font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors text-center sm:text-left">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="reveal flex flex-wrap justify-center gap-2">
          <span className="text-xs text-zinc-600 font-manrope mr-2 self-center uppercase tracking-widest">Branże:</span>
          {SECTORS.map((s, i) => (
            <span key={i} data-testid={`trust-sector-${i}`} className="text-xs font-manrope px-3 py-1.5 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors border border-white/5 hover:border-white/15" style={{ background: "rgba(255,255,255,0.02)" }}>{s}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
