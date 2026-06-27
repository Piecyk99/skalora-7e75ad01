// Wysyłka brandowanego maila ofertowego (demo/pitch) przez Resend.
// Bezpieczeństwo: anon JWT przechodzi (verify_jwt=true), ale realnie wysyłamy
// tylko na adresy z ALLOWED (żeby funkcja nie była otwartym relayem).
// Wywołanie (POST): { "to": "dpsolutionsbusiness@gmail.com", "subject"?: "..." }

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ENV_RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ENV_RESEND_FROM = Deno.env.get("RESEND_FROM");

const ALLOWED = new Set(["dpsolutionsbusiness@gmail.com"]);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...cors, "content-type": "application/json" } });

async function secret(db: ReturnType<typeof createClient>, name: string, envVal?: string): Promise<string | null> {
  if (envVal) return envVal;
  try { const { data } = await db.rpc("get_app_secret", { p_name: name }); return (data as string) || null; } catch { return null; }
}

// jeden kafelek KPI dashboardu
const tile = (label: string, value: string, color: string) =>
  `<td width="25%" valign="top" style="padding:6px;">
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#11141d;border:1px solid rgba(255,255,255,0.07);border-radius:12px;">
       <tr><td style="padding:15px 14px 13px;">
         <div style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#7e87a0;font-family:Arial,Helvetica,sans-serif;">${label}</div>
         <div style="font-size:30px;font-weight:800;color:${color};font-family:Arial,Helvetica,sans-serif;line-height:1.1;margin-top:6px;">${value}</div>
       </td></tr>
     </table>
   </td>`;

// chip w pasku górnym
const chip = (label: string, value: string, color: string) =>
  `<span style="display:inline-block;background:#11141d;border:1px solid rgba(255,255,255,0.08);border-radius:999px;padding:7px 14px;margin:0 7px 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#c7cddb;">
     <span style="color:${color};font-weight:800;">${value}</span> ${label}
   </span>`;

// karta modułu ERP (tytuł + krótki opis)
const mod = (title: string, desc: string, color: string) =>
  `<td width="50%" valign="top" style="padding:6px;">
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#11141d;border:1px solid rgba(255,255,255,0.07);border-radius:12px;height:100%;">
       <tr><td style="padding:14px 16px;">
         <div style="font-size:14px;font-weight:700;color:#e6e9f0;font-family:Arial,Helvetica,sans-serif;"><span style="color:${color};">●</span>&nbsp; ${title}</div>
         <div style="font-size:12px;color:#8b93a7;margin-top:5px;line-height:1.45;font-family:Arial,Helvetica,sans-serif;">${desc}</div>
       </td></tr>
     </table>
   </td>`;

function buildHtml(): string {
  const CY = "#22d3ee", GR = "#34d399", AM = "#f59e0b", RD = "#f43f5e", BL = "#60a5fa", NE = "#cbd5e1";
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#eef1f5;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#0b0d14;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="760" cellpadding="0" cellspacing="0" style="max-width:760px;width:100%;background:#0b0d14;border-radius:18px;overflow:hidden;border:1px solid rgba(0,0,0,0.12);box-shadow:0 10px 30px rgba(15,23,42,0.18);">

  <tr><td style="height:5px;line-height:5px;font-size:0;background:#22d3ee;background:linear-gradient(90deg,#00F0FF 0%,#6B8AFF 50%,#8A2BE2 100%);">&nbsp;</td></tr>

  <tr><td style="padding:36px 40px 6px;">
    <div style="font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:#7e87a0;">SKALORA · SYSTEM ERP</div>
    <h1 style="margin:10px 0 0;font-size:30px;line-height:1.25;font-weight:800;color:#ffffff;">
      Pełny system ERP dla Waszej firmy — od leada, przez ofertę, po montaż domu
    </h1>
    <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:#aeb6c6;">
      Cześć! Zbudujemy dla Was <strong style="color:#e6e9f0;">jeden system, który obejmuje cały
      proces budowy domu</strong> — nie tylko sprzedaż. Sprzedaż i CRM, finansowanie,
      <strong style="color:#e6e9f0;">architekci i projekty</strong>, pełna
      <strong style="color:#e6e9f0;">realizacja inwestycji</strong> oraz
      <strong style="color:#e6e9f0;">ekipy montażowe w terenie</strong> — wszystko dopasowane 1:1
      do tego, jak naprawdę pracuje Wasza firma, spięte w jednym dashboardzie. Podgląd niżej.
    </p>
  </td></tr>

  <!-- DASHBOARD PREVIEW -->
  <tr><td style="padding:24px 30px 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080a10;border:1px solid rgba(255,255,255,0.07);border-radius:16px;">
      <tr><td style="padding:20px 20px 6px;">
        <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7e87a0;margin-bottom:13px;">Dashboard operacyjny · podgląd</div>
        ${chip("Zadania", "163", CY)}${chip("Overdue", "156", RD)}${chip("Ryzyko", "7", AM)}${chip("Leady", "172", GR)}
      </td></tr>
      <tr><td style="padding:2px 14px 6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          ${tile("Nieprzypisane", "1", RD)}${tile("Bez next stepu", "65", AM)}${tile("Po terminie", "107", RD)}${tile("Blisko sprzedaży", "1", GR)}
        </tr></table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          ${tile("Po terminie (zadania)", "94", RD)}${tile("Dziś", "7", BL)}${tile("W ryzyku", "7", AM)}${tile("Zadania aktywne", "207", NE)}
        </tr></table>
      </td></tr>
      <tr><td style="padding:10px 20px 20px;">
        <div style="font-size:11px;color:#5f6880;">Jedno źródło prawdy (KPI z bazy w czasie rzeczywistym) — te same definicje na całym koncie.</div>
      </td></tr>
    </table>
  </td></tr>

  <!-- MODUŁY ERP -->
  <tr><td style="padding:26px 34px 4px;">
    <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#7e87a0;margin-bottom:4px;">Jeden system — wszystkie działy</div>
    <div style="font-size:13px;color:#7e87a0;margin-bottom:6px;">Sprzedaż → finansowanie → projekt → realizacja → montaż → rozliczenie</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${mod("Leady & Call Center", "Pozyskiwanie i kwalifikacja leadów, kampanie, scoring, kolejki połączeń.", CY)}
      ${mod("Oferty PDF & Katalogi", "Generator spersonalizowanych ofert i katalogów domów jednym kliknięciem.", CY)}
    </tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${mod("Handlowcy, zadania & SLA", "Przydziały, terminy, przypomnienia, prowizje — nic nie wypada z lejka.", GR)}
      ${mod("Finansowanie & kredyty", "Ścieżka kredytowa klienta, banki, komplet dokumentów i statusy.", GR)}
    </tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${mod("Architekci & projekty", "Uzgodnienia, wersje projektów, statusy i wymiana plików z pracownią.", BL)}
      ${mod("Realizacja inwestycji", "Od umowy do odbioru: etapy budowy, kamienie milowe, harmonogram.", BL)}
    </tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${mod("Ekipy montażowe", "Zlecenia i grafik ekip, postęp prac w terenie, zdjęcia i protokoły.", AM)}
      ${mod("Dokumenty & podpisy", "Umowy, protokoły odbioru, repozytorium plików z dostępem wg ról.", AM)}
    </tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${mod("Automatyzacje & newsletter", "Sekwencje e-mail/SMS, przypomnienia i powiadomienia — tracking otwarć.", CY)}
      ${mod("Monitoring bankowy", "Wpłaty, raty i rozliczenia inwestycji z automatycznymi alertami.", GR)}
    </tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${mod("Uprawnienia, role & RODO", "Każdy widzi tylko swoje dane — handlowiec, architekt, ekipa, zarząd.", NE)}
      ${mod("Aplikacja mobilna", "Dla ekip i handlowców w terenie — Android/iOS, praca z telefonu.", BL)}
    </tr></table>
  </td></tr>

  <tr><td style="padding:28px 40px 6px;">
    <a href="https://skalora.pl" style="display:inline-block;background:#22d3ee;background:linear-gradient(90deg,#00F0FF 0%,#6B8AFF 50%,#8A2BE2 100%);color:#050608;text-decoration:none;padding:15px 32px;border-radius:11px;font-weight:800;font-size:15px;">Umów krótkie demo →</a>
  </td></tr>

  <tr><td style="padding:24px 40px 32px;border-top:1px solid rgba(255,255,255,0.07);margin-top:10px;">
    <div style="font-size:12px;color:#5f6880;line-height:1.6;">
      Skalora · CRM &amp; automatyzacje sprzedaży<br>
      kontakt@skalora.pl · skalora.pl
    </div>
  </td></tr>

</table>
<div style="font-size:11px;color:#9aa3b2;margin-top:14px;font-family:Arial,Helvetica,sans-serif;">Wiadomość testowa (demo szablonu ofertowego).</div>
</td></tr></table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);

  let body: { to?: string; subject?: string } = {};
  try { body = await req.json(); } catch { /* */ }
  const to = (body.to ?? "").trim().toLowerCase();
  if (!to) return json({ error: "Brak adresu 'to'" }, 400);
  if (!ALLOWED.has(to)) return json({ error: `Adres ${to} nie jest na liście dozwolonych (demo).` }, 403);

  const RESEND_API_KEY = await secret(db, "RESEND_API_KEY", ENV_RESEND_API_KEY);
  const RESEND_FROM = (await secret(db, "RESEND_FROM", ENV_RESEND_FROM)) ?? "Skalora <kontakt@skalora.pl>";
  if (!RESEND_API_KEY) return json({ error: "Brak RESEND_API_KEY" }, 400);

  const subject = body.subject ?? "Pełny system ERP dla Waszej firmy — sprzedaż, realizacja, montaż w jednym";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html: buildHtml() }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) return json({ error: "Resend", status: res.status, detail: out }, 502);
  return json({ ok: true, to, from: RESEND_FROM, subject, id: out.id ?? null });
});
