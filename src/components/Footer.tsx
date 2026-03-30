const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Footer() {
  return (
    <footer data-testid="footer" className="py-12 border-t border-white/5 bg-skalora-bg">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="font-outfit font-black text-3xl tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 cursor-pointer" onClick={() => scrollTo("hero")}>SKALORA</div>
            <p className="text-zinc-500 font-manrope text-sm leading-relaxed max-w-sm">Kompletny system wzrostu dla firm, które myślą poważnie o wynikach. Nie robimy marketingu dla wyglądu — robimy go dla zysku.</p>
          </div>
          <div>
            <p className="text-xs font-manrope font-bold text-zinc-600 uppercase tracking-widest mb-4">Nawigacja</p>
            <div className="flex flex-col gap-3">
              {([["Rozwiązania", "solutions"], ["Awatar AI", "ai-avatar"], ["Proces", "process"], ["Dla kogo", "for-whom"], ["FAQ", "faq"]] as [string, string][]).map(([label, id]) => (
                <button key={id} onClick={() => scrollTo(id)} className="text-left text-zinc-500 hover:text-white transition-colors font-manrope text-sm" data-testid={`footer-link-${id}`}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-manrope font-bold text-zinc-600 uppercase tracking-widest mb-4">Kontakt</p>
            <div className="space-y-3">
              <button data-testid="footer-cta" onClick={() => scrollTo("contact")} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-manrope font-semibold py-3 rounded-full text-sm hover:scale-105 transition-transform duration-300">Umów konsultację</button>
              <p className="text-zinc-600 font-manrope text-xs text-center">Odpowiadamy w ciągu 24h</p>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 font-manrope text-xs">&copy; {new Date().getFullYear()} SKALORA. Wszelkie prawa zastrzeżone.</p>
          <p className="text-zinc-700 font-manrope text-xs">Systemy wzrostu &middot; Social Media &middot; AI &middot; Lejki &middot; Strony</p>
        </div>
      </div>
    </footer>
  );
}
