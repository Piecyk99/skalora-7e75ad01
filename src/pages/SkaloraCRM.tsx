import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Check, X,
  LayoutDashboard, ListChecks, CheckSquare, CalendarDays,
  Banknote, HardHat, Users, BarChart3, Mail, Bell, Landmark,
  Target, Settings, LogOut, Home, Plus, Building2,
  FileText, AlertTriangle, Clock, Phone, Filter,
  Brain, Flame, ChevronRight, PieChart, Eye,
  Zap, Shield, Code, Database, Layers, TrendingUp, Star,
  Wrench, Package,
} from "lucide-react";

// ── status / priority data ──────────────────────────────────────────────────
const SL: Record<string, string> = {
  do_przypisania:"Do przypisania",nowy:"Nowy",do_kontaktu:"Do kontaktu",
  brak_kontaktu:"Brak kontaktu",skontaktowany:"Skontaktowany",
  spotkanie_umowione:"Spotkanie umówione",po_spotkaniu:"Po spotkaniu",
  przygotowanie_wyceny:"Przyg. wyceny",oferta_wyslana:"Oferta wysłana",
  follow_up:"Follow-up",negocjacje:"Negocjacje",przygotowanie_umowy:"Przyg. umowy",
  finansowanie:"Finansowanie",wygrany:"Wygrany",przegrany:"Przegrany",zimny_lead:"Zimny lead",
};
const SC: Record<string, string> = {
  do_przypisania:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  nowy:"bg-blue-500/20 text-blue-400 border-blue-500/30",
  do_kontaktu:"bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  brak_kontaktu:"bg-slate-500/20 text-slate-400 border-slate-500/30",
  skontaktowany:"bg-teal-500/20 text-teal-400 border-teal-500/30",
  spotkanie_umowione:"bg-violet-500/20 text-violet-400 border-violet-500/30",
  po_spotkaniu:"bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  przygotowanie_wyceny:"bg-sky-500/20 text-sky-400 border-sky-500/30",
  oferta_wyslana:"bg-orange-500/20 text-orange-400 border-orange-500/30",
  follow_up:"bg-amber-500/20 text-amber-400 border-amber-500/30",
  negocjacje:"bg-amber-600/20 text-amber-400 border-amber-600/30",
  przygotowanie_umowy:"bg-purple-500/20 text-purple-400 border-purple-500/30",
  finansowanie:"bg-lime-500/20 text-lime-400 border-lime-500/30",
  wygrany:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  przegrany:"bg-red-500/20 text-red-400 border-red-500/30",
  zimny_lead:"bg-sky-500/20 text-sky-400 border-sky-500/30",
};
const PC: Record<string,string>={
  niski:"bg-green-500/20 text-green-400 border-green-500/30",
  sredni:"bg-blue-500/20 text-blue-400 border-blue-500/30",
  wysoki:"bg-orange-500/20 text-orange-400 border-orange-500/30",
  goracy:"bg-red-500/20 text-red-400 border-red-500/30",
};
const PL: Record<string,string>={niski:"Niski",sredni:"Średni",wysoki:"Wysoki",goracy:"Gorący"};
const FSC: Record<string,string>={
  nowe:"bg-blue-500/20 text-blue-400 border-blue-500/30",
  w_trakcie_analizy:"bg-amber-500/20 text-amber-400 border-amber-500/30",
  czekam_na_dokumenty:"bg-orange-500/20 text-orange-400 border-orange-500/30",
  wniosek_zlozony:"bg-purple-500/20 text-purple-400 border-purple-500/30",
  decyzja_pozytywna:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  decyzja_negatywna:"bg-red-500/20 text-red-400 border-red-500/30",
};
const FSL: Record<string,string>={
  nowe:"Nowe",w_trakcie_analizy:"W trakcie analizy",
  czekam_na_dokumenty:"Czeka na dok.",wniosek_zlozony:"Wniosek złożony",
  decyzja_pozytywna:"Decyzja ✓",decyzja_negatywna:"Decyzja ✗",
};

// ── mock data ───────────────────────────────────────────────────────────────
const LEADS=[
  {id:1,name:"Marcin Kowalski",phone:"+48 600 100 200",model:"Wenecja",status:"negocjacje",priority:"goracy",lead_score:92,next_step:"Podpisanie umowy",next_action_date:"02.05.2026"},
  {id:2,name:"Anna Nowak",phone:"+48 500 200 300",model:"Siena",status:"oferta_wyslana",priority:"wysoki",lead_score:78,next_step:"Follow-up tel.",next_action_date:"03.05.2026"},
  {id:3,name:"Tomasz Wiśniewski",phone:"+48 700 300 400",model:"Mediolan",status:"spotkanie_umowione",priority:"wysoki",lead_score:71,next_step:"Spotkanie na dz.",next_action_date:"05.05.2026"},
  {id:4,name:"Karolina Zając",phone:"+48 510 400 500",model:"Verona",status:"po_spotkaniu",priority:"sredni",lead_score:58,next_step:"Przyg. wyceny",next_action_date:"06.05.2026"},
  {id:5,name:"Piotr Lewandowski",phone:"+48 660 500 600",model:"Wenecja",status:"skontaktowany",priority:"sredni",lead_score:45,next_step:"Umów spotkanie",next_action_date:"08.05.2026"},
  {id:6,name:"Magdalena Dąbrowska",phone:"+48 720 600 700",model:"Lazio",status:"finansowanie",priority:"wysoki",lead_score:83,next_step:"Decyzja banku",next_action_date:"10.05.2026"},
  {id:7,name:"Jakub Szymański",phone:"+48 690 700 800",model:"Siena",status:"przygotowanie_wyceny",priority:"sredni",lead_score:62,next_step:"Wyślij ofertę",next_action_date:"07.05.2026"},
  {id:8,name:"Ewa Kamińska",phone:"+48 600 800 900",model:"Mediolan",status:"wygrany",priority:"goracy",lead_score:97,next_step:"Realizacja proj.",next_action_date:null},
];
const TASKS=[
  {id:1,title:"Zadzwoń do Marcina w sprawie finalizacji umowy",lead:"Marcin Kowalski",type:"Telefon",due:"01.05.2026",overdue:true},
  {id:2,title:"Wyślij wycenę Jakubowi Szymańskiemu",lead:"Jakub Szymański",type:"Email",due:"02.05.2026",overdue:false},
  {id:3,title:"Follow-up Annie Nowak po ofercie",lead:"Anna Nowak",type:"Telefon",due:"03.05.2026",overdue:false},
  {id:4,title:"Spotkanie z Tomaszem na działce",lead:"Tomasz Wiśniewski",type:"Spotkanie",due:"05.05.2026",overdue:false},
  {id:5,title:"Sprawdź decyzję banku dla Magdaleny",lead:"Magdalena Dąbrowska",type:"Finansow.",due:"30.04.2026",overdue:true},
];
const FUNNEL=[
  {color:"bg-blue-500",label:"Nowy",count:8},{color:"bg-teal-500",label:"Skontaktowany",count:11},
  {color:"bg-violet-500",label:"Spotkanie",count:7},{color:"bg-orange-500",label:"Oferta",count:9},
  {color:"bg-amber-500",label:"Negocjacje",count:4},{color:"bg-lime-500",label:"Finansowanie",count:3},
  {color:"bg-emerald-500",label:"Wygrany",count:5},
];
const KANBAN=[
  {label:"Nowy",c:"border-blue-500/50 bg-blue-500/5",leads:[{name:"Rafał Maj",model:"Wenecja",score:34},{name:"Zofia Piotrak",model:"Siena",score:28}]},
  {label:"Skontaktowany",c:"border-teal-500/50 bg-teal-500/5",leads:[{name:"Piotr Lewandowski",model:"Wenecja",score:45},{name:"Joanna Wróbel",model:"Lazio",score:51}]},
  {label:"Spotkanie",c:"border-violet-500/50 bg-violet-500/5",leads:[{name:"Tomasz Wiśniewski",model:"Mediolan",score:71}]},
  {label:"Oferta",c:"border-orange-500/50 bg-orange-500/5",leads:[{name:"Anna Nowak",model:"Siena",score:78},{name:"Jakub Szymański",model:"Siena",score:62}]},
  {label:"Negocjacje",c:"border-amber-500/50 bg-amber-500/5",leads:[{name:"Marcin Kowalski",model:"Wenecja",score:92}]},
  {label:"Wygrany",c:"border-emerald-500/50 bg-emerald-500/5",leads:[{name:"Ewa Kamińska",model:"Mediolan",score:97}]},
];
const FINANCING=[
  {id:1,lead:"Magdalena Dąbrowska",model:"Lazio",status:"wniosek_zlozony",bank:"PKO BP",amount:"380 000 zł",deadline:"15.05.2026"},
  {id:2,lead:"Tomasz Wiśniewski",model:"Mediolan",status:"w_trakcie_analizy",bank:"ING Bank",amount:"450 000 zł",deadline:"20.05.2026"},
  {id:3,lead:"Anna Nowak",model:"Siena",status:"czekam_na_dokumenty",bank:"Santander",amount:"412 000 zł",deadline:"10.05.2026"},
  {id:4,lead:"Rafał Maj",model:"Wenecja",status:"decyzja_pozytywna",bank:"mBank",amount:"320 000 zł",deadline:"01.05.2026"},
];
const REALIZACJA=[
  {id:1,name:"Dom Wenecja dla Kowalskich",model:"Wenecja",location:"Kraków, ul. Polna 12",status:"w_trakcie",progress:65,team:"Ekipa A",deadline:"15.07.2026"},
  {id:2,name:"Dom Siena dla Kamińskich",model:"Siena",location:"Gdańsk, ul. Leśna 5",status:"zakonczone",progress:100,team:"Ekipa B",deadline:"20.04.2026"},
  {id:3,name:"Dom Mediolan dla Nowaków",model:"Mediolan",location:"Wrocław, ul. Różana 8",status:"przygotowanie",progress:15,team:"Ekipa C",deadline:"30.09.2026"},
];
const EKIPY=[
  {id:1,name:"Ekipa A",leader:"Krzysztof Nowak",spec:"Konstrukcja + wykończenie",project:"Dom Wenecja",available:false,rating:4.8,members:6},
  {id:2,name:"Ekipa B",leader:"Marek Zieliński",spec:"Konstrukcja",project:"brak",available:true,rating:4.6,members:4},
  {id:3,name:"Ekipa C",leader:"Paweł Wiśniewski",spec:"Wykończenie + instalacje",project:"Dom Mediolan",available:false,rating:4.9,members:7},
];
const BANKS=[
  {bank:"mBank",rate:"6.65%",rrso:"6.89%",ltv:90,max:"900 000 zł",alert:true,msg:"Najlepsza oferta tygodnia"},
  {bank:"ING Bank",rate:"6.72%",rrso:"6.98%",ltv:85,max:"800 000 zł",alert:true,msg:"Obniżka o 0.1% od 01.05"},
  {bank:"PKO BP",rate:"6.85%",rrso:"7.12%",ltv:80,max:"700 000 zł",alert:false,msg:""},
  {bank:"BNP Paribas",rate:"6.78%",rrso:"7.05%",ltv:85,max:"750 000 zł",alert:false,msg:""},
  {bank:"Santander",rate:"6.90%",rrso:"7.20%",ltv:80,max:"650 000 zł",alert:false,msg:""},
  {bank:"Pekao SA",rate:"7.05%",rrso:"7.35%",ltv:75,max:"600 000 zł",alert:false,msg:""},
];
const OFERTY=[
  {id:1,lead:"Marcin Kowalski",model:"Wenecja",value:"485 000 zł",sent:"28.04.2026",status:"odpowiedź",views:3,time:"4m 12s"},
  {id:2,lead:"Anna Nowak",model:"Siena",value:"412 000 zł",sent:"29.04.2026",status:"przeczytana",views:1,time:"2m 05s"},
  {id:3,lead:"Jakub Szymański",model:"Siena",value:"398 000 zł",sent:"30.04.2026",status:"wysłana",views:0,time:"brak"},
  {id:4,lead:"Karolina Zając",model:"Verona",value:"531 000 zł",sent:"25.04.2026",status:"wygasła",views:2,time:"1m 45s"},
];

// ── sidebar nav ─────────────────────────────────────────────────────────────
type AV="Dashboard"|"Leady"|"Zadania"|"Kanban"|"Analytics"|"Finansowanie"|"Realizacja"|"Ekipy"|"Monitor Banków"|"Oferty";
const NAV=[{group:"Sprzedaż",items:[
  {label:"Dashboard",icon:LayoutDashboard},{label:"Leady",icon:ListChecks,badge:"8"},
  {label:"Zadania",icon:CheckSquare,badge:"3"},{label:"Oferty",icon:FileText},{label:"Kalendarz",icon:CalendarDays},
]},{group:"Operacje",items:[
  {label:"Finansowanie",icon:Banknote},{label:"Realizacja",icon:HardHat},
  {label:"Ekipy",icon:Users},{label:"Analytics",icon:BarChart3},{label:"Newsletter",icon:Mail},{label:"Powiadomienia",icon:Bell,badge:"2"},
]},{group:"Monitor Banków",items:[
  {label:"Monitor Banków",icon:Landmark},
]},{group:"Admin",items:[
  {label:"Kontrola procesu",icon:Target},{label:"Użytkownicy",icon:Users},{label:"Ustawienia",icon:Settings},
]}];
const INTERACTIVE:AV[]=["Dashboard","Leady","Zadania","Kanban","Analytics","Finansowanie","Realizacja","Ekipy","Monitor Banków","Oferty"];

function Sidebar({active,onSelect}:{active:AV;onSelect:(v:AV)=>void}){
  return(
    <div className="w-52 flex-shrink-0 flex flex-col overflow-hidden" style={{background:"#05050f",borderRight:"1px solid rgba(255,255,255,0.07)"}}>
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,rgba(0,240,255,0.25),rgba(138,43,226,0.25))",border:"1px solid rgba(0,240,255,0.3)"}}>
          <Building2 size={13} className="text-[#00F0FF]" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-white tracking-wide">Panel CRM</div>
          <div className="text-[9px]" style={{color:"rgba(255,255,255,0.3)"}}>v2.4.1 · live</div>
        </div>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      <div className="mx-3 my-2 p-2 rounded-xl flex items-center gap-2" style={{background:"rgba(138,43,226,0.1)",border:"1px solid rgba(138,43,226,0.2)"}}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{background:"rgba(138,43,226,0.2)",border:"1px solid rgba(138,43,226,0.3)"}}>
          <span className="text-[10px] font-black text-purple-300">MK</span>
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-white truncate">Marek Kowalczyk</div>
          <div className="text-[9px] text-purple-400">Manager</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1 space-y-3">
        {NAV.map(s=>(
          <div key={s.group}>
            <div className="px-4 pb-1 text-[9px] uppercase tracking-[0.18em] font-bold" style={{color:"rgba(255,255,255,0.2)"}}>{s.group}</div>
            <div className="space-y-px px-2">
              {s.items.map((item:any)=>{
                const ok=INTERACTIVE.includes(item.label as AV);
                const on=active===item.label;
                const I=item.icon;
                return(
                  <button key={item.label} onClick={()=>ok?onSelect(item.label as AV):undefined}
                    className={`relative w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-150 text-[12px] ${
                      on?"font-semibold":ok?"hover:bg-white/5 cursor-pointer":"cursor-default"
                    }`}
                    style={on?{background:"rgba(0,240,255,0.08)",color:"#00F0FF"}:{color:on?"#00F0FF":ok?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.2)"}}>
                    {on&&<span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#00F0FF]" />}
                    <I size={13} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge&&<span className={`text-[9px] rounded-full px-1.5 py-0.5 font-bold border ${item.label==="Zadania"?"bg-red-500/20 text-red-400 border-red-500/30":"bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 space-y-1" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-colors" style={{background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",color:"#34d399"}}>
          <Plus size={12}/> Nowy lead
        </button>
      </div>
    </div>
  );
}

// ── views ───────────────────────────────────────────────────────────────────
function ScoreBar({v,cls}:{v:number;cls:string}){
  return(
    <div className="flex items-center gap-1.5">
      <div className="w-12 rounded-full h-1.5" style={{background:"rgba(255,255,255,0.08)"}}>
        <div className={`h-1.5 rounded-full ${cls}`} style={{width:`${v}%`}} />
      </div>
      <span className="text-[10px] font-bold text-white">{v}</span>
    </div>
  );
}

function DashboardView(){
  return(
    <div className="p-5 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-white">Dashboard</h2>
        <span className="text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>01.05.2026 · live</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          {label:"Leady łącznie",value:"47",sub:"+3 dziś",g:"from-[#00F0FF] to-[#8A2BE2]"},
          {label:"Gorące 🔥",value:"8",sub:"wymagają kontaktu",g:"from-red-400 to-orange-500"},
          {label:"Zaległe zadania",value:"3",sub:"pilne",g:"from-red-500 to-rose-600"},
          {label:"Konwersja",value:"18.2%",sub:"wygranych/total",g:"from-emerald-400 to-teal-500"},
        ].map(m=>(
          <div key={m.label} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className={`text-xl font-black bg-gradient-to-r ${m.g} bg-clip-text text-transparent`}>{m.value}</div>
            <div className="text-[10px] text-white/70 mt-0.5">{m.label}</div>
            <div className="text-[9px] mt-0.5" style={{color:"rgba(255,255,255,0.3)"}}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
          <div className="flex items-center gap-2 mb-3"><Clock size={12} className="text-[#00F0FF]"/><span className="text-[12px] font-semibold text-white">Dzisiaj</span></div>
          <div className="space-y-2">
            {[{t:"Zadzwoń do Marcina K.",type:"Telefon",time:"10:00",overdue:true},{t:"Spotkanie z Tomaszem W.",type:"Spotkanie",time:"13:00",overdue:false},{t:"Wyślij wycenę dla Jakuba S.",type:"Email",time:"15:00",overdue:false}].map(x=>(
              <div key={x.t} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] ${x.overdue?"bg-red-500/10 border border-red-500/20":""}`} style={!x.overdue?{background:"rgba(255,255,255,0.04)"}:{}}>
                {x.overdue?<AlertTriangle size={10} className="text-red-400 flex-shrink-0"/>:<CheckSquare size={10} className="text-white/30 flex-shrink-0"/>}
                <span className={`flex-1 truncate ${x.overdue?"text-red-300":"text-white/70"}`}>{x.t}</span>
                <span className="text-[9px] text-white/30">{x.time}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.4)"}}>{x.type}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{background:"rgba(138,43,226,0.06)",border:"1px solid rgba(138,43,226,0.15)"}}>
          <div className="flex items-center gap-2 mb-3"><Brain size={12} className="text-purple-400"/><span className="text-[12px] font-semibold text-white">AI Scoring</span></div>
          <div className="space-y-2.5">
            {[{name:"Marcin Kowalski",score:92,note:"Negocjacje, gotowy",g:"bg-emerald-500"},{name:"Magdalena Dąbrowska",score:83,note:"Finansowanie w toku",g:"bg-lime-500"},{name:"Anna Nowak",score:78,note:"Follow-up wymagany",g:"bg-amber-500"}].map(a=>(
              <div key={a.name} className="flex items-center gap-2.5">
                <div className="text-[12px] font-black w-7 text-center text-white">{a.score}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-white truncate">{a.name}</div>
                  <div className="text-[9px]" style={{color:"rgba(255,255,255,0.3)"}}>{a.note}</div>
                </div>
                <div className="w-14" style={{background:"rgba(255,255,255,0.08)",borderRadius:"99px",height:"4px"}}>
                  <div className={`h-full rounded-full ${a.g}`} style={{width:`${a.score}%`}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div className="flex items-center gap-2 mb-3"><PieChart size={12} className="text-[#00F0FF]"/><span className="text-[12px] font-semibold text-white">Lejek sprzedaży</span><span className="ml-auto text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>47 leadów</span></div>
        <div className="space-y-1.5">
          {FUNNEL.map(s=>(
            <div key={s.label} className="flex items-center gap-2">
              <div className="text-[10px] w-24 truncate" style={{color:"rgba(255,255,255,0.5)"}}>{s.label}</div>
              <div className="flex-1 rounded-full h-3 overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}>
                <div className={`h-3 rounded-full ${s.color}/70`} style={{width:`${(s.count/47)*100}%`}} />
              </div>
              <div className="text-[11px] font-bold text-white w-5 text-right">{s.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadsView(){
  const [sel,setSel]=useState<number|null>(null);
  const lead=LEADS.find(l=>l.id===sel);
  return(
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <span className="text-[13px] font-bold text-white">Leady</span>
        <span className="text-[11px]" style={{color:"rgba(255,255,255,0.3)"}}> ({LEADS.length})</span>
        <div className="ml-auto flex gap-2">
          <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 opacity-50" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <Filter size={11} style={{color:"rgba(255,255,255,0.4)"}} /><span className="text-[11px]" style={{color:"rgba(255,255,255,0.4)"}}>Filtruj</span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 z-10" style={{background:"#05050f"}}>
              <tr style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                {["Imię i nazwisko","Telefon","Model","Status","Priorytet","Score","Next step","Termin"].map(h=>(
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider" style={{color:"rgba(255,255,255,0.3)"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEADS.map(l=>(
                <tr key={l.id} onClick={()=>setSel(sel===l.id?null:l.id)}
                  className="cursor-pointer transition-all duration-150"
                  style={sel===l.id?{background:"rgba(0,240,255,0.05)",borderBottom:"1px solid rgba(0,240,255,0.1)"}:{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <td className="px-3 py-2.5 font-semibold text-white">{l.name}</td>
                  <td className="px-3 py-2.5" style={{color:"rgba(255,255,255,0.5)"}}>{l.phone}</td>
                  <td className="px-3 py-2.5"><span className="font-medium" style={{color:"#00F0FF"}}>{l.model}</span></td>
                  <td className="px-3 py-2.5"><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${SC[l.status]??""}`}>{SL[l.status]}</span></td>
                  <td className="px-3 py-2.5"><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${PC[l.priority]??""}`}>{l.priority==="goracy"?"🔥 ":""}{PL[l.priority]}</span></td>
                  <td className="px-3 py-2.5"><ScoreBar v={l.lead_score} cls={l.lead_score>=80?"bg-emerald-500":l.lead_score>=60?"bg-amber-500":"bg-slate-500"}/></td>
                  <td className="px-3 py-2.5" style={{color:"rgba(255,255,255,0.5)"}}>{l.next_step}</td>
                  <td className="px-3 py-2.5" style={{color:"rgba(255,255,255,0.3)"}}>{l.next_action_date??"brak"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lead&&(
          <div className="w-56 flex-shrink-0 overflow-y-auto" style={{borderLeft:"1px solid rgba(255,255,255,0.06)",background:"#05050f"}}>
            <div className="p-4" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="flex justify-between">
                <div><div className="text-[12px] font-bold text-white">{lead.name}</div><div className="text-[10px] mt-0.5" style={{color:"rgba(255,255,255,0.3)"}}>{lead.phone}</div></div>
                <button onClick={()=>setSel(null)} className="text-white/30 hover:text-white text-xl leading-none">×</button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div><div className="text-[9px] uppercase tracking-wider mb-1" style={{color:"rgba(255,255,255,0.3)"}}>Model</div><div className="text-[12px] font-bold" style={{color:"#00F0FF"}}>{lead.model}</div></div>
              <div><div className="text-[9px] uppercase tracking-wider mb-1" style={{color:"rgba(255,255,255,0.3)"}}>Status</div><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${SC[lead.status]??""}`}>{SL[lead.status]}</span></div>
              <div><div className="text-[9px] uppercase tracking-wider mb-1" style={{color:"rgba(255,255,255,0.3)"}}>Priorytet</div><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${PC[lead.priority]??""}`}>{lead.priority==="goracy"?"🔥 ":""}{PL[lead.priority]}</span></div>
              <div><div className="text-[9px] uppercase tracking-wider mb-1" style={{color:"rgba(255,255,255,0.3)"}}>AI Score</div><ScoreBar v={lead.lead_score} cls={lead.lead_score>=80?"bg-emerald-500":lead.lead_score>=60?"bg-amber-500":"bg-slate-500"}/></div>
              <div><div className="text-[9px] uppercase tracking-wider mb-1" style={{color:"rgba(255,255,255,0.3)"}}>Next step</div><div className="text-[11px] text-white/70">{lead.next_step}</div></div>
              <div className="pt-2 space-y-1.5" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                <button className="w-full flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg opacity-60 cursor-not-allowed" style={{background:"rgba(0,240,255,0.07)",border:"1px solid rgba(0,240,255,0.2)",color:"#00F0FF"}}><Phone size={11}/> Zadzwoń</button>
                <button className="w-full flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg opacity-60 cursor-not-allowed" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)"}}><FileText size={11}/> Generuj ofertę</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TasksView(){
  const [f,setF]=useState<"all"|"overdue">("all");
  const items=TASKS.filter(t=>f==="all"?true:t.overdue);
  return(
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <span className="text-[13px] font-bold text-white">Zadania</span>
        <div className="ml-auto flex gap-1">
          {(["all","overdue"] as const).map(v=>(
            <button key={v} onClick={()=>setF(v)} className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${f===v?"text-white font-semibold":""}`}
              style={f===v?{background:"rgba(255,255,255,0.1)"}:{color:"rgba(255,255,255,0.4)"}}>
              {v==="all"?"Wszystkie":"Zaległe"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map(t=>(
          <div key={t.id} className={`rounded-xl px-4 py-3 ${t.overdue?"border border-red-500/20":""}`}
            style={t.overdue?{background:"rgba(239,68,68,0.06)"}:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="flex items-start gap-3">
              {t.overdue?<AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0"/>:<CheckSquare size={13} className="flex-shrink-0" style={{color:"rgba(255,255,255,0.25)"}}/>}
              <div className="flex-1 min-w-0">
                <div className={`text-[12px] font-semibold ${t.overdue?"text-red-200":"text-white"}`}>{t.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>{t.lead}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.4)"}}>{t.type}</span>
                  {t.overdue&&<span className="text-[10px] text-red-400 font-bold">⚠ Zaległe</span>}
                </div>
              </div>
              <div className={`text-[10px] flex-shrink-0 ${t.overdue?"text-red-400 font-bold":""}`} style={!t.overdue?{color:"rgba(255,255,255,0.3)"}:{}}>{t.due}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanView(){
  return(
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <span className="text-[13px] font-bold text-white">Kanban: Pipeline</span>
        <span className="ml-auto text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>Kliknij kartę aby zobaczyć szczegóły</span>
      </div>
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-2 h-full" style={{minWidth:`${KANBAN.length*155}px`}}>
          {KANBAN.map(col=>(
            <div key={col.label} className="w-36 flex-shrink-0 flex flex-col">
              <div className={`border-t-2 ${col.c} rounded-t-lg px-3 py-2 mb-2`}>
                <div className="text-[11px] font-bold text-white">{col.label}</div>
                <div className="text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>{col.leads.length} leadów</div>
              </div>
              <div className="space-y-2">
                {col.leads.map(l=>(
                  <div key={l.name} className="rounded-xl p-2.5 hover:border-white/20 transition-all cursor-pointer" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                    <div className="text-[11px] font-semibold text-white leading-tight">{l.name}</div>
                    <div className="text-[10px] mt-1" style={{color:"#00F0FF",opacity:0.7}}>{l.model}</div>
                    <ScoreBar v={l.score} cls={l.score>=80?"bg-emerald-500":l.score>=60?"bg-amber-500":"bg-slate-500"}/>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsView(){
  const total=FUNNEL.reduce((s,f)=>s+f.count,0);
  return(
    <div className="p-5 space-y-4 overflow-y-auto h-full">
      <h2 className="text-[13px] font-bold text-white">Analytics</h2>
      <div className="grid grid-cols-3 gap-3">
        {[{l:"Leady łącznie",v:"47",c:"text-[#00F0FF]"},{l:"Wygrane",v:"5",c:"text-emerald-400"},{l:"Konwersja",v:"10.6%",c:"text-amber-400"}].map(m=>(
          <div key={m.l} className="rounded-xl p-3 text-center" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className={`text-xl font-black ${m.c}`}>{m.v}</div>
            <div className="text-[10px] mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{m.l}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div className="text-[12px] font-semibold text-white mb-3">Lejek sprzedaży</div>
        <div className="space-y-2">
          {FUNNEL.map(s=>(
            <div key={s.label} className="flex items-center gap-3">
              <div className="text-[10px] w-28 truncate" style={{color:"rgba(255,255,255,0.4)"}}>{s.label}</div>
              <div className="flex-1 rounded-full h-4 overflow-hidden relative" style={{background:"rgba(255,255,255,0.05)"}}>
                <div className={`h-4 rounded-full ${s.color}/60`} style={{width:`${(s.count/total)*100}%`}} />
                <span className="absolute inset-0 flex items-center pl-2 text-[10px] text-white/70 font-semibold">{s.count}</span>
              </div>
              <div className="text-[10px] w-8" style={{color:"rgba(255,255,255,0.3)"}}>{((s.count/total)*100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinansowanieView(){
  return(
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <span className="text-[13px] font-bold text-white">Finansowanie hipoteczne</span>
        <span className="text-[11px]" style={{color:"rgba(255,255,255,0.3)"}}> ({FINANCING.length})</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0" style={{background:"#05050f"}}>
            <tr style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              {["Klient","Model","Status finansowania","Bank","Kwota","Termin"].map(h=>(
                <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider" style={{color:"rgba(255,255,255,0.3)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FINANCING.map(c=>(
              <tr key={c.id} className="cursor-pointer transition-colors hover:bg-white/5" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <td className="px-3 py-3 font-semibold text-white">{c.lead}</td>
                <td className="px-3 py-3"><span style={{color:"#00F0FF"}}>{c.model}</span></td>
                <td className="px-3 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${FSC[c.status]??""}`}>{FSL[c.status]}</span></td>
                <td className="px-3 py-3" style={{color:"rgba(255,255,255,0.6)"}}>{c.bank}</td>
                <td className="px-3 py-3 font-semibold text-white">{c.amount}</td>
                <td className="px-3 py-3" style={{color:"rgba(255,255,255,0.3)"}}>{c.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RealizacjaView(){
  const sc:{[k:string]:{l:string;c:string}}={
    w_trakcie:{l:"W trakcie",c:"bg-blue-500/20 text-blue-400 border-blue-500/30"},
    zakonczone:{l:"Zakończone",c:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30"},
    przygotowanie:{l:"Przygotowanie",c:"bg-amber-500/20 text-amber-400 border-amber-500/30"},
  };
  return(
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <span className="text-[13px] font-bold text-white">Realizacja projektów</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {REALIZACJA.map(p=>{
          const s=sc[p.status]||{l:p.status,c:""};
          return(
            <div key={p.id} className="rounded-xl p-4 hover:border-white/15 transition-all cursor-pointer" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-[12px] font-bold text-white">{p.name}</div>
                  <div className="text-[10px] mt-0.5" style={{color:"rgba(255,255,255,0.3)"}}>{p.location}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${s.c}`}>{s.l}</span>
                  <span className="text-[10px] font-semibold" style={{color:"#00F0FF"}}>{p.model}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>Postęp</span>
                    <span className="text-[10px] font-bold text-white">{p.progress}%</span>
                  </div>
                  <div className="rounded-full h-2" style={{background:"rgba(255,255,255,0.08)"}}>
                    <div className={`h-2 rounded-full ${p.progress===100?"bg-emerald-500":p.progress>50?"bg-blue-500":"bg-amber-500"}`} style={{width:`${p.progress}%`}} />
                  </div>
                </div>
                <div className="text-[10px] flex-shrink-0" style={{color:"rgba(255,255,255,0.3)"}}>Ekipa: <span className="text-white/70">{p.team}</span></div>
                <div className="text-[10px] flex-shrink-0" style={{color:"rgba(255,255,255,0.3)"}}>Do: <span className="text-white/70">{p.deadline}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EkipyView(){
  return(
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <span className="text-[13px] font-bold text-white">Ekipy budowlane</span>
        <button className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors" style={{background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.25)",color:"#34d399"}}>
          <Plus size={11}/> Dodaj ekipę
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {EKIPY.map(e=>(
          <div key={e.id} className="rounded-xl p-4 hover:border-white/15 transition-all cursor-pointer" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"rgba(138,43,226,0.15)",border:"1px solid rgba(138,43,226,0.25)"}}>
                  <span className="text-[11px] font-black text-purple-300">{e.name.split(" ")[1]}</span>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-white">{e.name}</div>
                  <div className="text-[10px] mt-0.5" style={{color:"rgba(255,255,255,0.3)"}}>Lider: {e.leader}</div>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${e.available?"bg-emerald-500/20 text-emerald-400 border-emerald-500/30":"bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                {e.available?"Dostępna":"Zajęta"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div><div className="text-[9px] mb-0.5" style={{color:"rgba(255,255,255,0.3)"}}>Specjalizacja</div><div className="text-white/70">{e.spec}</div></div>
              <div><div className="text-[9px] mb-0.5" style={{color:"rgba(255,255,255,0.3)"}}>Projekt</div><div className="text-white/70 truncate">{e.project}</div></div>
              <div className="text-right"><div className="text-[9px] mb-0.5" style={{color:"rgba(255,255,255,0.3)"}}>Ocena / Skład</div><div className="text-amber-400 font-bold">★ {e.rating} <span className="text-white/40 font-normal">{e.members} os.</span></div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonitorBankowView(){
  return(
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <span className="text-[13px] font-bold text-white">Monitor Banków</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400" style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"99px",padding:"2px 8px"}}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0" style={{background:"#05050f"}}>
            <tr style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              {["Bank","Oprocentowanie","RRSO","LTV max","Max kwota","Alert"].map(h=>(
                <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider" style={{color:"rgba(255,255,255,0.3)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BANKS.map((b,i)=>(
              <tr key={b.bank} className="cursor-pointer transition-colors hover:bg-white/5" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center" style={{background:"rgba(255,255,255,0.08)"}}>
                      <span className="text-[8px] font-black text-white/60">{b.bank.slice(0,2).toUpperCase()}</span>
                    </div>
                    <span className="font-semibold text-white">{b.bank}</span>
                    {i===0&&<span className="text-[9px] font-bold" style={{background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"99px",padding:"1px 6px",color:"#34d399"}}>BEST</span>}
                  </div>
                </td>
                <td className="px-3 py-3 font-bold" style={{color:"#00F0FF"}}>{b.rate}</td>
                <td className="px-3 py-3" style={{color:"rgba(255,255,255,0.5)"}}>{b.rrso}</td>
                <td className="px-3 py-3" style={{color:"rgba(255,255,255,0.5)"}}>{b.ltv}%</td>
                <td className="px-3 py-3" style={{color:"rgba(255,255,255,0.5)"}}>{b.max}</td>
                <td className="px-3 py-3">
                  {b.alert?<div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/><span className="text-[10px] text-amber-400 font-medium">{b.msg}</span></div>:<span style={{color:"rgba(255,255,255,0.2)"}}>brak</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OfertyView(){
  const ss:{[k:string]:string}={"wysłana":"bg-blue-500/20 text-blue-400 border-blue-500/30","przeczytana":"bg-amber-500/20 text-amber-400 border-amber-500/30","odpowiedź":"bg-emerald-500/20 text-emerald-400 border-emerald-500/30","wygasła":"bg-slate-500/20 text-slate-400 border-slate-500/30"};
  return(
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <span className="text-[13px] font-bold text-white">Oferty PDF: śledzenie</span>
        <button className="ml-auto flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg" style={{background:"rgba(0,240,255,0.07)",border:"1px solid rgba(0,240,255,0.2)",color:"#00F0FF"}}><Plus size={11}/> Nowa oferta</button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0" style={{background:"#05050f"}}>
            <tr style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              {["Klient","Model","Wartość","Status","Wysłano","Otwarcia","Czas"].map(h=>(
                <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider" style={{color:"rgba(255,255,255,0.3)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OFERTY.map(o=>(
              <tr key={o.id} className="cursor-pointer hover:bg-white/5 transition-colors" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <td className="px-3 py-3 font-semibold text-white">{o.lead}</td>
                <td className="px-3 py-3" style={{color:"#00F0FF"}}>{o.model}</td>
                <td className="px-3 py-3 font-semibold text-white">{o.value}</td>
                <td className="px-3 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${ss[o.status]??""}`}>{o.status}</span></td>
                <td className="px-3 py-3" style={{color:"rgba(255,255,255,0.3)"}}>{o.sent}</td>
                <td className="px-3 py-3"><div className="flex items-center gap-1"><Eye size={10} style={{color:"rgba(255,255,255,0.3)"}} /><span className={o.views>0?"text-white font-bold":""} style={o.views===0?{color:"rgba(255,255,255,0.2)"}:{}}>{o.views}</span></div></td>
                <td className="px-3 py-3" style={{color:"rgba(255,255,255,0.4)"}}>{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── CRM Preview shell ────────────────────────────────────────────────────────
function CRMPreview({fullScreen}:{fullScreen?:boolean}){
  const [active,setActive]=useState<AV>("Dashboard");
  const top:AV[]=["Dashboard","Leady","Zadania","Kanban","Analytics"];
  return(
    <div className="flex flex-col h-full" style={{background:"#030308",borderRadius:fullScreen?"0":"16px",overflow:"hidden"}}>
      {/* chrome */}
      <div className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0" style={{background:"#07070f",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 rounded-md px-4 py-1 text-[11px]" style={{background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.3)"}}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> app.twoj-crm.pl
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {top.map(t=>(
            <button key={t} onClick={()=>setActive(t)}
              className="px-2.5 py-1 rounded text-[11px] transition-all"
              style={active===t?{background:"rgba(0,240,255,0.12)",color:"#00F0FF",fontWeight:600}:{color:"rgba(255,255,255,0.3)"}}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {/* shell */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={active} onSelect={setActive}/>
        <div className="flex-1 overflow-hidden">
          {active==="Dashboard"&&<DashboardView/>}
          {active==="Leady"&&<LeadsView/>}
          {active==="Zadania"&&<TasksView/>}
          {active==="Kanban"&&<KanbanView/>}
          {active==="Analytics"&&<AnalyticsView/>}
          {active==="Finansowanie"&&<FinansowanieView/>}
          {active==="Realizacja"&&<RealizacjaView/>}
          {active==="Ekipy"&&<EkipyView/>}
          {active==="Monitor Banków"&&<MonitorBankowView/>}
          {active==="Oferty"&&<OfertyView/>}
        </div>
      </div>
    </div>
  );
}

// ── integrations & features data ─────────────────────────────────────────────
const INTS=[
  {title:"API & Techniczne",icon:Code,accent:"#00F0FF",items:[{n:"REST API",d:"Pełna integracja przez HTTP/JSON, własne ERP, bazy, dowolne zewnętrzne systemy."},{n:"Webhooks",d:"Real-time eventy przy każdej akcji, nowy lead, zmiana statusu, wygrany deal."},{n:"GraphQL",d:"Elastyczne zapytania dla zaawansowanych integracji i raportowania w czasie rzeczywistym."}]},
  {title:"No-code Automatyzacje",icon:Zap,accent:"#F59E0B",items:[{n:"Zapier",d:"Połącz z 6000+ aplikacjami bez kodu, Gmail, Sheets, Trello, Notion i tysiące innych."},{n:"Make.com",d:"Zaawansowane scenariusze z warunkami, pętlami i transformacjami danych."},{n:"n8n",d:"Open-source automation z własnym hostingiem, pełna kontrola bez abonamentów."}]},
  {title:"Komunikacja",icon:Mail,accent:"#A855F7",items:[{n:"Email SMTP/IMAP",d:"Dwukierunkowa synchronizacja, cała korespondencja w profilu leada."},{n:"WhatsApp Business",d:"Wysyłaj i odbieraj WhatsApp bezpośrednio z karty klienta w CRM."},{n:"SMS via Twilio",d:"Automatyczne SMS z szablonami, harmonogramem i śledzeniem dostarczenia."}]},
  {title:"Marketing & Lead Gen",icon:TrendingUp,accent:"#10B981",items:[{n:"Facebook Lead Ads",d:"Leady z Meta trafiają do CRM w czasie rzeczywistym z auto-przypisaniem."},{n:"Google Ads / Forms",d:"Importuj leady i śledź ROI każdej kampanii w dashboardzie CRM."},{n:"Formularz embed",d:"Wstaw na stronę, każde zgłoszenie to nowy lead z pełnym tracking UTM."}]},
  {title:"Workspace",icon:Bell,accent:"#6366F1",items:[{n:"Google Workspace",d:"Gmail, Calendar i Drive zsynchronizowane z CRM, spotkania i email w jednym."},{n:"Slack",d:"Powiadomienia o leadach i zadaniach zaległych bezpośrednio na kanale Slack."},{n:"Microsoft 365",d:"Outlook, Teams i OneDrive dla firm działających w ekosystemie Microsoft."}]},
  {title:"Bazy danych",icon:Database,accent:"#EF4444",items:[{n:"PostgreSQL / MySQL",d:"Import historycznych danych i synchronizacja dwustronna z własną bazą."},{n:"Google Sheets",d:"Eksportuj raporty i synchronizuj dane z arkuszami, dla całego zespołu."},{n:"S3 / R2 Storage",d:"Dokumenty i oferty klientów w chmurze, dostęp z karty leada."}]},
];
const FEATS=[
  {icon:ListChecks,title:"16-etapowy pipeline",d:"Od Do przypisania do Wygranego, każdy lead ma precyzyjny status, historię i właściciela."},
  {icon:Brain,title:"AI Scoring",d:"Automatyczna ocena szansy zamknięcia, system wskazuje komu zadzwonić w pierwszej kolejności."},
  {icon:Banknote,title:"Moduł finansowania",d:"Śledzenie wniosków kredytowych, decyzji banku i dokumentów finansowych klienta."},
  {icon:Landmark,title:"Monitor banków live",d:"Bieżące oferty kredytowe 6 banków z automatycznym alertem o zmianie oprocentowania."},
  {icon:HardHat,title:"Realizacja & ekipy",d:"Zarządzanie projektami budowlanymi, zleceniami dla ekip, harmonogramem i postępem."},
  {icon:Building2,title:"Katalog modeli domów",d:"Wenecja, Siena, Mediolan, Verona, Lazio, wyceny, konfigurator i generator ofert PDF."},
  {icon:Users,title:"Multi-role & team",d:"Admin, manager, handlowiec, finansowanie, realizacja, ekipa, każda rola widzi to, co powinna."},
  {icon:BarChart3,title:"Analytics real-time",d:"Konwersja wg modelu, handlowca, kampanii, wykresy eksportowalne do PDF/Excel."},
  {icon:Shield,title:"Własna instancja",d:"Twoje dane na Twoim serwerze. Zero limitu użytkowników. Zero abonamentu od siedzenia."},
];

// ── main page ────────────────────────────────────────────────────────────────
export default function SkaloraCRMPage(){
  const [demo,setDemo]=useState(false);
  return(
    <div className="min-h-screen text-white" style={{background:"#030308"}}>

      {/* nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl" style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(3,3,8,0.85)"}}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-black text-xl bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent tracking-tight">SKALORA</span>
            <div className="hidden sm:flex items-center gap-1 rounded-lg p-1" style={{background:"rgba(255,255,255,0.05)"}}>
              <Link to="/" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-md transition-colors">Agencja</Link>
              <span className="px-3 py-1.5 text-sm font-semibold rounded-md" style={{background:"rgba(0,240,255,0.1)",color:"#00F0FF"}}>CRM</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setDemo(true)} className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block">Demo</button>
            <Link to="/#contact" className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 hover:scale-[1.02]" style={{background:"linear-gradient(135deg,#00F0FF,#8A2BE2)",color:"#000"}}>
              Zamów wdrożenie
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-0 px-6 overflow-hidden">
        {/* bg blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full" style={{background:"radial-gradient(circle,rgba(0,240,255,0.07) 0%,transparent 70%)",filter:"blur(40px)"}} />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full" style={{background:"radial-gradient(circle,rgba(138,43,226,0.08) 0%,transparent 70%)",filter:"blur(40px)"}} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full" style={{background:"radial-gradient(ellipse,rgba(0,240,255,0.04) 0%,transparent 70%)",filter:"blur(60px)"}} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8" style={{background:"rgba(0,240,255,0.08)",border:"1px solid rgba(0,240,255,0.2)",color:"#00F0FF"}}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
            Dedykowany CRM SaaS · budownictwo · OZE · deweloperzy
          </div>

          <h1 className="font-black tracking-tighter leading-[0.9] mb-6" style={{fontSize:"clamp(52px,8vw,96px)"}}>
            <span className="block text-white">Sprzedaż.</span>
            <span className="block bg-gradient-to-r from-[#00F0FF] via-[#4DFFFF] to-[#8A2BE2] bg-clip-text text-transparent">Realizacja.</span>
            <span className="block text-white">Ekipy.</span>
          </h1>

          <p className="text-xl mb-10 max-w-xl mx-auto" style={{color:"rgba(255,255,255,0.5)",lineHeight:"1.6"}}>
            16-etapowy pipeline, AI scoring leadów, moduł finansowania hipotecznego,
            monitor banków i zarządzanie ekipami budowlanymi, w jednym systemie na Twoim serwerze.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button onClick={()=>setDemo(true)} className="group flex items-center gap-2.5 font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-[1.03] hover:opacity-90" style={{background:"linear-gradient(135deg,#00F0FF,#8A2BE2)",color:"#000"}}>
              Interaktywne demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/#contact" className="flex items-center gap-2 font-semibold px-8 py-4 rounded-2xl text-lg transition-all hover:border-white/30" style={{border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.8)"}}>
              Zamów wdrożenie
            </Link>
          </div>

          {/* floating stats */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            {[
              {v:"16",l:"etapów pipeline",c:"#00F0FF"},
              {v:"AI",l:"scoring leadów",c:"#A855F7"},
              {v:"10+",l:"modułów CRM",c:"#10B981"},
              {v:"6",l:"ról użytkowników",c:"#F59E0B"},
              {v:"∞",l:"użytkowników",c:"#EF4444"},
            ].map(s=>(
              <div key={s.l} className="flex items-center gap-2 rounded-full px-4 py-2" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <span className="font-black text-sm" style={{color:s.c}}>{s.v}</span>
                <span className="text-sm" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* preview */}
        <div className="relative w-full max-w-6xl mx-auto z-10">
          {/* glow behind preview */}
          <div className="absolute -inset-4 rounded-3xl pointer-events-none" style={{background:"radial-gradient(ellipse at 50% 0%,rgba(0,240,255,0.12) 0%,transparent 70%)",filter:"blur(20px)"}} />
          <div className="relative rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,240,255,0.15)",boxShadow:"0 0 80px rgba(0,240,255,0.06),0 40px 80px rgba(0,0,0,0.6)"}}>
            <div className="text-center py-2" style={{background:"rgba(0,240,255,0.06)",borderBottom:"1px solid rgba(0,240,255,0.1)"}}>
              <span className="text-[11px] font-medium" style={{color:"rgba(0,240,255,0.7)"}}>↙ Pełny, klikalny system, kliknij moduły, leady, oferty, kalendarz ↗</span>
            </div>
            <iframe
              src="https://crm.skalora.pl/demo.html"
              title="Demo Skalora CRM"
              loading="lazy"
              style={{ width: "100%", height: "640px", border: 0, display: "block", background: "#070d1c" }}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
            <a href="https://crm.skalora.pl/demo.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-all hover:opacity-90 hover:scale-[1.02]" style={{background:"linear-gradient(135deg,#00F0FF,#8A2BE2)",color:"#000"}}>
              Otwórz pełne demo <ArrowRight size={15}/>
            </a>
            <p className="text-center text-[12px]" style={{color:"rgba(255,255,255,0.3)"}}>
              Dashboard · Leady · Realizacja · Oferty PDF · Kalendarz · Ekipy · Finansowanie
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 py-28" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-6" style={{background:"rgba(138,43,226,0.08)",border:"1px solid rgba(138,43,226,0.2)",color:"#A855F7"}}>
              <Package size={13}/> Funkcjonalności
            </div>
            <h2 className="font-black tracking-tighter text-white mb-4" style={{fontSize:"clamp(32px,5vw,56px)"}}>
              Wszystko czego potrzebuje<br/>
              <span className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">firma budowlana</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{color:"rgba(255,255,255,0.4)"}}>Jeden system zamiast Excela, notesu i dziesiątek arkuszy.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATS.map(f=>(
              <div key={f.title} className="rounded-2xl p-5 group transition-all duration-200 hover:scale-[1.02]" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background:"rgba(0,240,255,0.1)",border:"1px solid rgba(0,240,255,0.15)"}}>
                  <f.icon size={18} className="text-[#00F0FF]" />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{color:"rgba(255,255,255,0.4)"}}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section className="px-6 py-24" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-black tracking-tighter text-white mb-3" style={{fontSize:"clamp(28px,4vw,48px)"}}>Pipeline sprzedaży w 16 etapach</h2>
            <p style={{color:"rgba(255,255,255,0.4)"}}>Pełna kontrola nad każdym leadem od pierwszego kontaktu do podpisanej umowy.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(SL).slice(1,12).map(([k,v],i,arr)=>(
              <div key={k} className="flex items-center gap-1.5">
                <span className={`px-3 py-1.5 rounded-full border text-sm font-medium ${SC[k]??""}`}>{v}</span>
                {i<arr.length-1&&<ChevronRight size={14} style={{color:"rgba(255,255,255,0.15)"}}/>}
              </div>
            ))}
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[{icon:Flame,t:"Priorytet gorący",d:"System oznacza leady wymagające natychmiastowej akcji na podstawie daty i statusu.",c:"text-red-400",bg:"rgba(239,68,68,0.08)",bc:"rgba(239,68,68,0.15)"},{icon:Brain,t:"AI Score 0-100",d:"Każdy lead dostaje ocenę szansy zamknięcia, algorytm uwzględnia aktywność i historię.",c:"text-purple-400",bg:"rgba(168,85,247,0.08)",bc:"rgba(168,85,247,0.15)"},{icon:Target,t:"Kontrola procesu",d:"Manager widzi w czasie rzeczywistym które leady stoją w miejscu i wymagają interwencji.",c:"text-[#00F0FF]",bg:"rgba(0,240,255,0.06)",bc:"rgba(0,240,255,0.12)"}].map(x=>(
              <div key={x.t} className="rounded-2xl p-5" style={{background:x.bg,border:`1px solid ${x.bc}`}}>
                <x.icon size={20} className={`${x.c} mb-3`}/>
                <div className="font-bold text-white mb-1.5">{x.t}</div>
                <div className="text-sm leading-relaxed" style={{color:"rgba(255,255,255,0.4)"}}>{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section className="px-6 py-24" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-6" style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",color:"#818cf8"}}>
              <Layers size={13}/> Ekosystem integracji
            </div>
            <h2 className="font-black tracking-tighter text-white mb-4" style={{fontSize:"clamp(28px,4vw,48px)"}}>
              Łączy się z wszystkim,{" "}
              <span className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">czego używasz</span>
            </h2>
            <p className="text-lg" style={{color:"rgba(255,255,255,0.4)"}}>REST API, Webhooks, Zapier, Make.com, Gmail, WhatsApp, Facebook Ads, Slack i więcej.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INTS.map(g=>{
              const GI=g.icon;
              return(
                <div key={g.title} className="rounded-2xl overflow-hidden transition-all hover:border-white/15" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div className="px-5 py-4 flex items-center gap-3" style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${g.accent}18`,border:`1px solid ${g.accent}30`}}>
                      <GI size={15} style={{color:g.accent}}/>
                    </div>
                    <h3 className="text-sm font-bold text-white">{g.title}</h3>
                  </div>
                  <div>
                    {g.items.map(item=>(
                      <div key={item.n} className="px-5 py-3.5 transition-colors hover:bg-white/[0.02]" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{background:g.accent}}/>
                          <div>
                            <div className="text-sm font-semibold text-white">{item.n}</div>
                            <div className="text-xs leading-relaxed mt-0.5" style={{color:"rgba(255,255,255,0.35)"}}>{item.d}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-10 rounded-2xl p-8 text-center" style={{background:"linear-gradient(135deg,rgba(0,240,255,0.05),rgba(138,43,226,0.05))",border:"1px solid rgba(255,255,255,0.08)"}}>
            <p className="font-bold text-xl text-white mb-2">Potrzebujesz niestandardowej integracji?</p>
            <p className="text-sm mb-5 max-w-xl mx-auto" style={{color:"rgba(255,255,255,0.4)"}}>Masz własny ERP, CMS, albo system rozliczeniowy? Wdrożymy dedykowaną integrację przez REST API lub Webhook.</p>
            <Link to="/#contact" className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all hover:opacity-90" style={{background:"linear-gradient(135deg,#00F0FF,#8A2BE2)",color:"#000"}}>
              Porozmawiajmy o integracji <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse at 50% 50%,rgba(0,240,255,0.06) 0%,transparent 70%)",filter:"blur(30px)"}} />
          <h2 className="relative font-black tracking-tighter text-white mb-4" style={{fontSize:"clamp(32px,5vw,56px)"}}>
            Gotowy na CRM,<br/>który skaluje Twój biznes?
          </h2>
          <p className="relative text-lg mb-10" style={{color:"rgba(255,255,255,0.4)"}}>Wdrożymy system dopasowany do Twojego procesu sprzedaży i realizacji w ciągu 48 godzin.</p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={()=>setDemo(true)} className="group flex items-center gap-2.5 font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-[1.02] hover:opacity-90" style={{background:"linear-gradient(135deg,#00F0FF,#8A2BE2)",color:"#000"}}>
              Interaktywne demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </button>
            <Link to="/#contact" className="font-semibold px-8 py-4 rounded-2xl text-lg transition-all" style={{border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)"}}>
              Porozmawiajmy
            </Link>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="px-6 py-8" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent tracking-tight">SKALORA CRM</span>
          <div className="flex gap-6 text-sm" style={{color:"rgba(255,255,255,0.3)"}}>
            <Link to="/" className="hover:text-white transition-colors">Agencja</Link>
            <button onClick={()=>setDemo(true)} className="hover:text-white transition-colors">Demo</button>
            <Link to="/#contact" className="hover:text-white transition-colors">Kontakt</Link>
          </div>
        </div>
      </footer>

      {/* demo modal */}
      {demo&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)"}}>
          <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col rounded-2xl" style={{background:"#030308",border:"1px solid rgba(0,240,255,0.15)",boxShadow:"0 0 80px rgba(0,240,255,0.08)"}}>
            <div className="flex items-center justify-between px-6 py-4" style={{borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
              <div>
                <span className="font-bold text-white">Demo: Panel CRM</span>
                <p className="text-xs mt-0.5" style={{color:"rgba(255,255,255,0.3)"}}>Przykładowe dane, eksploruj wszystkie moduły</p>
              </div>
              <button onClick={()=>setDemo(false)} className="text-white/30 hover:text-white text-2xl transition-colors leading-none">×</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe src="https://crm.skalora.pl/demo.html" title="Demo Skalora CRM (pełny ekran)" style={{ width: "100%", height: "100%", minHeight: "70vh", border: 0, display: "block", background: "#070d1c" }} />
            </div>
            <div className="px-6 py-4 flex items-center justify-between" style={{borderTop:"1px solid rgba(255,255,255,0.07)"}}>
              <p className="text-sm" style={{color:"rgba(255,255,255,0.4)"}}>Chcesz taki system dla swojej firmy?</p>
              <Link to="/#contact" onClick={()=>setDemo(false)} className="inline-flex items-center gap-2 font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:opacity-90" style={{background:"linear-gradient(135deg,#00F0FF,#8A2BE2)",color:"#000"}}>
                Zamów wdrożenie <ArrowRight size={15}/>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
