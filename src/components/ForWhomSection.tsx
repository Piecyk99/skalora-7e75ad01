import { Briefcase, User, Mic, GraduationCap, MapPin, ArrowRight, LucideIcon } from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";

interface Audience {
  icon: LucideIcon;
  title: string;
  desc: string;
  tags: string[];
  accent: string;
}

const AUDIENCES: Audience[] = [
  { icon: Briefcase, title: "Firmy usługowe", desc: "Prawnicy, doradcy, agencje, firmy B2B — chcesz przewidywalnego napływu zapytań bez polegania wyłącznie na poleceniach.", tags: ["Leady", "Lejek", "Strona"], accent: "#00F0FF" },
  { icon: User, title: "Eksperci i konsultanci", desc: "Masz wiedzę i know-how, ale brakuje Ci systemu, który dowozi klientów regularnie i monetyzuje Twoją ekspertyzę na skalę.", tags: ["Autorytet", "Kurs", "Monetyzacja"], accent: "#8A2BE2" },
  { icon: Mic, title: "Marki osobiste", desc: "Coach, influencer, lider branży — chcesz zbudować silną pozycję, zarabiać na wiedzy i nie musieć cały czas nagrywać.", tags: ["AI Avatar", "Content", "Zasięg"], accent: "#00F0FF" },
  { icon: GraduationCap, title: "Edukatorzy i trenerzy", desc: "Chcesz stworzyć kurs online lub program mentoringowy, który skaluje Twoje zarobki bez skalowania Twojego czasu pracy.", tags: ["Kurs", "Lejek", "Automatyzacja"], accent: "#8A2BE2" },
  { icon: MapPin, title: "Firmy lokalne", desc: "Restauracja, klinika, salon — chcesz dominować online w swoim regionie i przyciągać lokalnych klientów przez content i stronę.", tags: ["Local SEO", "Social Media", "Leady"], accent: "#00F0FF" },
];

const SENSE_ITEMS = [
  "Klient jest dla Ciebie wartościowy i zależy Ci na jakości zapytań, nie tylko ich liczbie",
  "Chcesz stałego napływu zapytań z internetu, a nie polegania wyłącznie na poleceniach",
  "Chcesz połączyć marketing, content i obsługę leada w jeden spójny system",
  "Szukasz partnera, który myśli o Twoim wyniku — nie o liczbie postów",
  "Chcesz skalować firmę bez proporcjonalnego wzrostu czasu pracy",
  "Masz już klientów i chcesz ich więcej, albo dopiero budujesz system pozyskiwania",
];

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function ForWhomSection() {
  const ref = useScrollReveal();

  return (
    <section id="for-whom" data-testid="for-whom-section" className="py-20 sm:py-28 bg-skalora-bg" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="overline reveal mb-4">Dla kogo</div>
          <h2 className="reveal font-outfit font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-5">
            SKALORA jest dla firm,{" "}<span className="gradient-text">które naprawdę chcą rosnąć</span>
          </h2>
          <p className="reveal text-base text-zinc-400 max-w-xl mx-auto font-manrope">Nie pracujemy z każdym. Szukamy partnerów, którzy poważnie podchodzą do wzrostu i chcą zbudować system — nie tylko zaistnieć w mediach społecznościowych.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {AUDIENCES.map((a, i) => {
            const Icon = a.icon;
            const rgba = a.accent === "#00F0FF" ? "0,240,255" : "138,43,226";
            return (
              <div key={i} data-testid={`audience-card-${i}`} className={`reveal reveal-delay-${(i % 3) + 1} gradient-border p-6 card-hover group`} style={{ background: "#070710" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: `rgba(${rgba},0.1)`, border: `1px solid rgba(${rgba},0.2)` }}>
                  <Icon size={20} style={{ color: a.accent }} />
                </div>
                <h3 className="font-outfit font-bold text-white text-lg mb-2">{a.title}</h3>
                <p className="text-zinc-400 font-manrope text-sm leading-relaxed mb-4">{a.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {a.tags.map((tag, j) => (
                    <span key={j} className="text-xs font-manrope px-2.5 py-1 rounded-full" style={{ background: `rgba(${rgba},0.07)`, border: `1px solid rgba(${rgba},0.15)`, color: a.accent }}>{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}

          <div data-testid="audience-cta-card" className="reveal reveal-delay-3 gradient-border p-6 flex flex-col items-center justify-center text-center cursor-pointer card-hover group" style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.04) 0%, rgba(138,43,226,0.04) 100%)" }} onClick={() => scrollTo("contact")}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: "linear-gradient(135deg, #00F0FF 0%, #8A2BE2 100%)" }}>
              <ArrowRight size={22} className="text-[#030305]" />
            </div>
            <h3 className="font-outfit font-bold text-white text-base mb-2">To brzmi jak Ty?</h3>
            <p className="text-zinc-400 font-manrope text-sm">Umów bezpłatną konsultację i sprawdź, co możemy zbudować razem.</p>
          </div>
        </div>

        <div className="reveal mt-14 gradient-border p-8 sm:p-10" style={{ background: "#070710" }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="font-outfit font-black text-xl sm:text-2xl text-white mb-6">To ma sens, jeśli:</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {SENSE_ITEMS.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#8A2BE2] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#030305" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p className="text-zinc-300 font-manrope text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-zinc-600 font-manrope text-xs mt-6 pt-6 border-t border-white/5">To rozwiązanie nie jest dla firm, które szukają tylko ładnych postów bez celu biznesowego.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
