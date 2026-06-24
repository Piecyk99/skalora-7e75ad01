// Wysyłka outreach (approve -> sent). Resend HTTPS API; dry-run gdy brak klucza.
// Bramka RODO: wymaga aktywnej zgody 'wdrozenie_crm' dla adresu odbiorcy.
// Dokleja pixel open-tracking i (opcjonalnie) CTA przez track-click.
// Wywołanie (POST, JWT pracownika): { "id": "<outreach_id>" }

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ENV_RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ENV_RESEND_FROM = Deno.env.get("RESEND_FROM");
const ENV_BOOKING_URL = Deno.env.get("BOOKING_URL");
const FN = `${SUPABASE_URL}/functions/v1`;

// Sekrety: najpierw env, w razie braku — Vault przez RPC (service_role). Pozwala
// skonfigurować wysyłkę bez ustawiania env w panelu.
async function secret(db: ReturnType<typeof createClient>, name: string, envVal?: string): Promise<string | null> {
  if (envVal) return envVal;
  try {
    const { data } = await db.rpc("get_app_secret", { p_name: name });
    return (data as string) || null;
  } catch { return null; }
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...cors, "content-type": "application/json" } });

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);

  // konfiguracja Resend z env -> Vault
  const RESEND_API_KEY = await secret(db, "RESEND_API_KEY", ENV_RESEND_API_KEY);
  const RESEND_FROM = (await secret(db, "RESEND_FROM", ENV_RESEND_FROM)) ?? "Skalora <onboarding@resend.dev>";
  const BOOKING_URL = await secret(db, "BOOKING_URL", ENV_BOOKING_URL);

  let id = "";
  try { id = (await req.json()).id; } catch { /* */ }
  if (!id) return json({ error: "Brak id" }, 400);

  const { data: o, error } = await db.from("outreach").select("*").eq("id", id).single();
  if (error || !o) return json({ error: "Outreach nie istnieje" }, 404);
  if (o.status !== "approved") return json({ error: `Wysłać można tylko zaakceptowany (stan=${o.status})` }, 400);

  // odbiorca z leada
  let email: string | null = null;
  if (o.partner_lead_id) {
    const { data: lead } = await db.from("partner_leads").select("email").eq("id", o.partner_lead_id).single();
    email = lead?.email ?? null;
  }
  if (!email) return json({ error: "Brak adresu e-mail odbiorcy (uzupełnij lead)" }, 400);

  // bramka RODO: aktywna zgoda na wdrozenie_crm dla tego adresu
  const { count } = await db.from("consents").select("id", { count: "exact", head: true })
    .eq("subject_email", email).eq("cel", "wdrozenie_crm").is("revoked_at", null);
  if (!count || count < 1) {
    return json({ error: "Brak zgody RODO (wdrozenie_crm) dla tego adresu — nie wysłano." }, 403);
  }

  // treść HTML + pixel + opcjonalne CTA — szablon w identyfikacji wizualnej Skalora
  // (paleta z landing skalora.pl: tło #030305, gradient cyan #00F0FF -> fiolet #8A2BE2).
  const pixel = `<img src="${FN}/track-open?o=${id}" width="1" height="1" alt="" style="display:none">`;
  const bodyHtml = esc(o.tresc ?? "").replace(/\n/g, "<br>");
  const cta = BOOKING_URL
    ? `<p style="margin:26px 0 4px;"><a href="${FN}/track-click?o=${id}&u=${encodeURIComponent(BOOKING_URL)}" `
      + `style="display:inline-block;background:#00F0FF;background:linear-gradient(90deg,#00F0FF 0%,#6B8AFF 50%,#8A2BE2 100%);color:#030305;text-decoration:none;padding:13px 26px;border-radius:10px;font-weight:700;font-size:14px;">Umów krótką rozmowę</a></p>`
    : "";
  const html = `<!doctype html><html lang="pl"><body style="margin:0;background:#030305;padding:24px 12px;font-family:'Outfit','Manrope',Arial,Helvetica,sans-serif;color:#ffffff;">`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">`
    + `<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0A0A10;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">`
    + `<tr><td style="height:4px;line-height:4px;font-size:0;background:#00F0FF;background:linear-gradient(90deg,#00F0FF 0%,#6B8AFF 50%,#8A2BE2 100%);">&nbsp;</td></tr>`
    + `<tr><td style="padding:30px 32px 4px;">`
    + `<div style="font-size:26px;font-weight:800;letter-spacing:3px;color:#ffffff;">SKALORA</div>`
    + `<div style="font-size:12px;color:#A1A1AA;margin-top:6px;letter-spacing:0.3px;">System pozyskiwania klientów online</div>`
    + `</td></tr>`
    + `<tr><td style="padding:18px 32px 4px;font-size:15px;line-height:1.7;color:#E7E7EA;">${bodyHtml}${cta}</td></tr>`
    + `<tr><td style="padding:0 32px;"><div style="height:1px;background:rgba(255,255,255,0.08);margin:22px 0 0;"></div></td></tr>`
    + `<tr><td style="padding:18px 32px 30px;font-size:12px;color:#71717A;line-height:1.6;">`
    + `<div style="color:#A1A1AA;">Łączymy content, landing page, CRM i automatyzację w jeden system, który zamienia uwagę w leady, konsultacje i sprzedaż.</div>`
    + `<div style="margin-top:12px;">Skalora · <a href="mailto:kontakt@skalora.pl" style="color:#00F0FF;text-decoration:none;">kontakt@skalora.pl</a> · <a href="https://skalora.pl" style="color:#00F0FF;text-decoration:none;">skalora.pl</a></div>`
    + `<div style="margin-top:6px;color:#52525B;">Otrzymujesz tę wiadomość, ponieważ wyraziłeś zgodę na kontakt w sprawie wdrożenia CRM.</div>`
    + `</td></tr></table></td></tr></table>${pixel}</body></html>`;

  // wysyłka
  let providerId: string | null = null;
  if (RESEND_API_KEY) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: RESEND_FROM, to: [email], subject: o.temat ?? "(bez tematu)", html }),
    });
    if (!r.ok) {
      const errTxt = await r.text();
      await db.from("outreach").update({ last_error: `Resend ${r.status}: ${errTxt}`.slice(0, 500) }).eq("id", id);
      await db.from("outreach_events").insert({ outreach_id: id, event_type: "error", meta: { status: r.status } });
      return json({ error: `Resend ${r.status}: ${errTxt}` }, 502);
    }
    try { providerId = (await r.json())?.id ?? null; } catch { /* brak id w body — OK */ }
  }

  await db.from("outreach").update({
    status: "sent", sent_at: new Date().toISOString(), recipient_email: email,
    provider_message_id: providerId, last_error: null,
  }).eq("id", id);
  await db.from("outreach_events").insert({
    outreach_id: id, event_type: "sent", meta: { mode: RESEND_API_KEY ? "resend" : "dry_run", to: email },
  });
  await db.from("activity_log").insert({
    entity_type: "outreach", entity_id: id, event_type: "status_change", old_value: "approved", new_value: "sent",
  });

  return json({ ok: true, mode: RESEND_API_KEY ? "resend" : "dry_run", to: email });
});
