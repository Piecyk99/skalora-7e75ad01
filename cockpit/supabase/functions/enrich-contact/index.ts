// Enrichment kontaktów (Faza 3+). Dla firmy (partner_leads) lub prospektu szuka w sieci
// PUBLICZNYCH danych kontaktowych (e-mail biuro@/kontakt@, telefon, www) — zwykle z podstrony
// "Kontakt" strony firmy — i uzupełnia puste pola. Tryb pojedynczy (id) i hurtowy (limit).
// - Web search po stronie Anthropic (web_search_20260209). NIE zmyśla danych.
// - Nie nadpisuje pól, które już mają wartość. RODO: tylko publiczne dane firmowe.
//
// Wywołanie (POST, JWT pracownika):
//   { "target": "lead"|"prospect", "id"?: "<uuid>", "limit"?: 8 }

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ENV_ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-4-8";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...cors, "content-type": "application/json" } });

async function resolveAnthropicKey(db: ReturnType<typeof createClient>): Promise<string | undefined> {
  if (ENV_ANTHROPIC_KEY) return ENV_ANTHROPIC_KEY;
  try { const { data } = await db.rpc("get_anthropic_key"); return (data as string) || undefined; } catch { return undefined; }
}

async function authorize(req: Request, db: ReturnType<typeof createClient>): Promise<boolean> {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret) {
    const { data: expected } = await db.rpc("get_cron_secret");
    if (expected && cronSecret === expected) return true;
  }
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const { data: u } = await db.auth.getUser(token);
  const uid = u?.user?.id;
  if (!uid) return false;
  const { data: roles } = await db.from("user_roles").select("role").eq("user_id", uid).limit(1);
  return (roles ?? []).length > 0;
}

interface Contact { email?: string; telefon?: string; www?: string }

// Jedno zapytanie web-search o kontakt firmy. Zwraca tylko pewne, publiczne dane.
async function findContact(
  apiKey: string,
  firma: string,
  hint: { www?: string | null; miasto?: string | null; nip?: string | null },
): Promise<Contact> {
  const system =
    "Jesteś researcherem B2B. Szukasz w internecie PUBLICZNYCH danych kontaktowych firmy: " +
    "adres e-mail (najlepiej firmowy biuro@/kontakt@/info@), telefon i adres strony www. " +
    "Sprawdź stronę firmy (zwłaszcza podstronę Kontakt) i wiarygodne katalogi. " +
    "NIE zmyślaj — podaj tylko dane potwierdzone w wynikach. Brakujące pole pomiń. Zwróć WYŁĄCZNIE poprawny JSON.";
  const userMsg =
    `Znajdź dane kontaktowe firmy: "${firma}"` +
    (hint.www ? `, strona: ${hint.www}` : "") +
    (hint.miasto ? `, miasto: ${hint.miasto}` : "") +
    (hint.nip ? `, NIP: ${hint.nip}` : "") +
    `.\nZwróć wyłącznie JSON: {"email":"...","telefon":"...","www":"..."} (pomiń pola, których nie ma pewnych).`;

  const messages: Array<Record<string, unknown>> = [{ role: "user", content: userMsg }];
  let finalText = "";
  for (let i = 0; i < 4; i++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 4 }],
        messages,
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    if (data.stop_reason === "refusal") return {};
    messages.push({ role: "assistant", content: data.content });
    if (data.stop_reason === "pause_turn") continue;
    finalText = (data.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n");
    break;
  }
  const m = finalText.match(/\{[\s\S]*\}/);
  if (!m) return {};
  try {
    const p = JSON.parse(m[0]);
    return {
      email: p.email ? String(p.email).trim() : undefined,
      telefon: p.telefon ? String(p.telefon).trim() : undefined,
      www: p.www ? String(p.www).trim() : undefined,
    };
  } catch { return {}; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);
  if (!(await authorize(req, db))) return json({ error: "Brak uprawnień" }, 401);

  const apiKey = await resolveAnthropicKey(db);
  if (!apiKey) return json({ error: "Brak klucza AI — enrichment wymaga skonfigurowanego ANTHROPIC_API_KEY." }, 400);

  let body: { target?: string; id?: string; limit?: number } = {};
  try { body = await req.json(); } catch { /* puste body */ }
  const target = body.target === "prospect" ? "prospect" : "lead";
  const limit = Math.min(Math.max(Number(body.limit ?? 8), 1), 12);

  let processed = 0, updated = 0;
  const results: Array<Record<string, unknown>> = [];

  if (target === "lead") {
    // pobranie wierszy: pojedynczo (id) lub hurtowo (brak e-maila, nie odrzucone)
    const sel = db.from("partner_leads").select("id, firma_nazwa, nip, email, telefon, www");
    const { data: rows } = body.id
      ? await sel.eq("id", body.id)
      : await sel.or("email.is.null,email.eq.").neq("status", "odrzucony").limit(limit);
    for (const r of rows ?? []) {
      processed++;
      try {
        const c = await findContact(apiKey, r.firma_nazwa as string, { www: r.www as string, nip: r.nip as string });
        const patch: Contact = {};
        if (!r.email && c.email) patch.email = c.email;
        if (!r.telefon && c.telefon) patch.telefon = c.telefon;
        if (!r.www && c.www) patch.www = c.www;
        if (Object.keys(patch).length) {
          const { error } = await db.from("partner_leads").update(patch).eq("id", r.id);
          if (!error) { updated++; results.push({ firma: r.firma_nazwa, ...patch }); }
        }
      } catch (e) { results.push({ firma: r.firma_nazwa, error: (e as Error).message }); }
    }
  } else {
    const sel = db.from("prospects").select("id, firma_nazwa, nip, raw_data");
    const { data: rows } = body.id
      ? await sel.eq("id", body.id)
      : await sel.neq("status", "odrzucony").limit(limit);
    for (const r of rows ?? []) {
      const rd = (r.raw_data ?? {}) as Record<string, unknown>;
      if (!body.id && rd.email) continue; // hurtowo: pomiń te, co mają e-mail
      processed++;
      try {
        const c = await findContact(apiKey, r.firma_nazwa as string, { www: rd.www as string, miasto: rd.miasto as string, nip: r.nip as string });
        const next = { ...rd };
        let changed = false;
        if (!rd.email && c.email) { next.email = c.email; changed = true; }
        if (!rd.telefon && c.telefon) { next.telefon = c.telefon; changed = true; }
        if (!rd.www && c.www) { next.www = c.www; changed = true; }
        if (changed) {
          const { error } = await db.from("prospects").update({ raw_data: next }).eq("id", r.id);
          if (!error) { updated++; results.push({ firma: r.firma_nazwa, email: c.email, telefon: c.telefon, www: c.www }); }
        }
      } catch (e) { results.push({ firma: r.firma_nazwa, error: (e as Error).message }); }
    }
  }

  return json({ engine: "claude", model: ANTHROPIC_MODEL, target, processed, updated, results });
});
