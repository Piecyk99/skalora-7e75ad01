import { useState, FormEvent } from "react";
import { ArrowRight, CheckCircle, AlertCircle, Loader, ChevronRight } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";
import { submitLead } from "@/lib/crm-api";

const STAGE_OPTIONS = [
  "Dopiero zaczynam (0-1 rok)",
  "Rozwijam się (1-3 lata)",
  "Dojrzała firma (3+ lat)",
  "Skaluję i szukam kolejnego poziomu",
];

const BLOCKER_OPTIONS = [
  "Brak stałego napływu klientów",
  "Treści nie generują sprzedaży",
  "Strona nie konwertuje",
  "Brak lejka sprzedażowego",
  "Brak czasu na marketing",
  "Nie wiem, od czego zacząć",
];

const INIT = { name: "", email: "", phone: "", company_stage: "", growth_blocker: "" };

export default function ContactSection() {
  const [form, setForm] = useState(INIT);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const ref = useScrollReveal();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.phone) setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        company_stage: form.company_stage || undefined,
        growth_blocker: form.growth_blocker || undefined,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" data-testid="contact-section" className="py-20 sm:py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #030305 0%, #060612 60%, #030305 100%)" }} ref={ref}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(0,240,255,0.05) 0%, rgba(138,43,226,0.05) 50%, transparent 70%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="overline reveal mb-4">Zacznijmy</div>
          <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-5">
            Jeśli chcesz zdobywać więcej klientów{" "}<span className="gradient-text">— porozmawiajmy.</span>
          </h2>
          <p className="reveal text-base text-zinc-400 max-w-2xl mx-auto font-manrope">Krótka rozmowa strategiczna. Bez oferty handlowej. Pokażemy, co konkretnie można zrobić w Twoim przypadku.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div className="reveal space-y-5">
            {[
              { n: "01", title: "Sprawdzimy, gdzie uciekają Ci klienci", desc: "Bezpłatna konsultacja diagnostyczna. Analizujemy Twój obecny proces i wskazujemy konkretne miejsca, w których tracisz potencjalnych klientów." },
              { n: "02", title: "Indywidualny plan, nie szablon", desc: "Każda strategia budowana jest od nowa, dopasowana do Twojego biznesu, rynku i celów. Nie dostajesz ogólnej oferty." },
              { n: "03", title: "Odpowiedź w ciągu 24 godzin", desc: "Skontaktujemy się z Tobą szybko, z konkretną propozycją, a nie kolejną prezentacją bez konkretów." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-outfit font-black text-xs" style={{ background: "linear-gradient(135deg, #00F0FF 0%, #8A2BE2 100%)", color: "#030305" }}>{item.n}</div>
                <div>
                  <h3 className="font-outfit font-bold text-white text-base mb-1">{item.title}</h3>
                  <p className="text-zinc-400 font-manrope text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}

            <div className="mt-4 pt-5 border-t border-white/5 grid grid-cols-3 gap-3">
              {["Bez zobowiązania", "Odpowiadamy szybko", "Krótka rozmowa strategiczna"].map((t, i) => (
                <div key={i} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-1.5 h-1.5 rounded-full mx-auto mb-2" style={{ background: "linear-gradient(135deg,#00F0FF,#8A2BE2)" }} />
                  <p className="text-xs text-zinc-400 font-manrope font-medium">{t}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-xl" style={{ background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.12)" }}>
              <p className="text-xs font-manrope text-zinc-400 leading-relaxed">
                <span className="text-cyan-400 font-semibold">Uczciwie:</span> jesteśmy na początku drogi. Każdą współpracę traktujemy jako projekt referencyjny, dlatego Twój projekt dostanie pełną uwagę, nie obsługę z szablonu.
              </p>
            </div>
          </div>

          <div className="reveal gradient-border p-7" style={{ background: "#070710" }}>
            {status === "success" ? (
              <div data-testid="contact-success" className="flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(0,240,255,0.1)", border: "2px solid rgba(0,240,255,0.3)" }}>
                  <CheckCircle size={32} className="text-cyan-400" />
                </div>
                <h3 className="font-outfit font-bold text-white text-2xl mb-3">Wiadomość wysłana!</h3>
                <p className="text-zinc-400 font-manrope text-sm leading-relaxed mb-5">Dziękujemy. Odezwiemy się w ciągu 24 godzin z konkretną propozycją dla Twojej firmy.</p>
                <button onClick={() => { setStatus("idle"); setStep(1); setForm(INIT); }} className="text-sm text-cyan-400 font-manrope hover:underline">Wyślij kolejne zapytanie</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-outfit font-black transition-all duration-300" style={{ background: step >= s ? "linear-gradient(135deg,#00F0FF,#8A2BE2)" : "rgba(255,255,255,0.06)", color: step >= s ? "#030305" : "#71717a" }}>{s}</div>
                      <span className="text-xs font-manrope text-zinc-500">{s === 1 ? "Dane kontaktowe" : "O firmie"}</span>
                      {s === 1 && <ChevronRight size={14} className="text-zinc-700 mx-1" />}
                    </div>
                  ))}
                </div>

                {step === 1 && (
                  <form data-testid="contact-form-step1" onSubmit={handleStep1} className="space-y-4">
                    <div>
                      <label className="block text-xs font-manrope font-bold text-zinc-400 uppercase tracking-widest mb-2">Imię *</label>
                      <input data-testid="form-name" className="dark-input" placeholder="Jan Kowalski" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-manrope font-bold text-zinc-400 uppercase tracking-widest mb-2">E-mail *</label>
                      <input data-testid="form-email" type="email" className="dark-input" placeholder="jan@firma.pl" value={form.email} onChange={(e) => set("email", e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-manrope font-bold text-zinc-400 uppercase tracking-widest mb-2">Telefon *</label>
                      <input data-testid="form-phone" className="dark-input" placeholder="+48 000 000 000" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
                    </div>
                    <button data-testid="form-next" type="submit" className="group w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-white font-manrope font-semibold py-4 rounded-full transition-all duration-300">
                      Dalej <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-center text-xs text-zinc-600 font-manrope">Bezpłatna konsultacja &middot; Zero spamu</p>
                  </form>
                )}

                {step === 2 && (
                  <form data-testid="contact-form-step2" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-manrope font-bold text-zinc-400 uppercase tracking-widest mb-2">Na jakim etapie jest firma?</label>
                      <select data-testid="form-stage" className="dark-input" value={form.company_stage} onChange={(e) => set("company_stage", e.target.value)}>
                        <option value="">Wybierz etap...</option>
                        {STAGE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-manrope font-bold text-zinc-400 uppercase tracking-widest mb-2">Co dziś najbardziej blokuje wzrost?</label>
                      <select data-testid="form-blocker" className="dark-input" value={form.growth_blocker} onChange={(e) => set("growth_blocker", e.target.value)}>
                        <option value="">Wybierz główny bloker...</option>
                        {BLOCKER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    {status === "error" && (
                      <div data-testid="contact-error" className="flex items-center gap-2 p-3 rounded-xl text-sm font-manrope text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <AlertCircle size={16} />
                        Coś poszło nie tak. Spróbuj ponownie.
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(1)} className="px-5 py-4 rounded-full border border-white/10 text-zinc-400 hover:text-white font-manrope text-sm transition-colors">Wróć</button>
                      <button data-testid="contact-submit" type="submit" disabled={status === "loading"} className="group flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-manrope font-bold py-4 rounded-full shadow-[0_0_30px_rgba(0,240,255,0.2)] hover:shadow-[0_0_50px_rgba(138,43,226,0.4)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
                        {status === "loading" ? <Loader size={18} className="animate-spin" /> : <>Umów konsultację <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                      </button>
                    </div>
                    <p className="text-center text-xs text-zinc-600 font-manrope">Odpowiedź w 24h &middot; Bez zobowiązań</p>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
