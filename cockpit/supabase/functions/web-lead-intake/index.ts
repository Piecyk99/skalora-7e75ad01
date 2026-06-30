// Publiczny odbiór formularza ze strony skalora.pl -> tabela website_leads (cockpit).
// verify_jwt=false (otwarty endpoint dla strony). Insert przez service_role (RLS bez insert z frontu).
// Prosty anty-dubel: ten sam e-mail z ostatnich 10 min jest pomijany.
// Wywołanie (POST): { imie, email, telefon?, company_stage?, growth_blocker?, wiadomosc? }

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...cors, "content-type": "application/json" } });

const clean = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) || null : null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* puste */ }

  const email = clean(body.email, 200);
  const imie = clean(body.imie ?? body.name, 200);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: "Podaj poprawny adres e-mail." }, 400);
  }

  const row = {
    imie,
    email: email.toLowerCase(),
    telefon: clean(body.telefon ?? body.phone, 60),
    company_stage: clean(body.company_stage, 200),
    growth_blocker: clean(body.growth_blocker, 200),
    wiadomosc: clean(body.wiadomosc ?? body.message, 4000),
    source: clean(body.source, 80) ?? "skalora.pl",
    status: "nowy",
  };

  const db = createClient(SUPABASE_URL, SERVICE_ROLE);

  // anty-dubel: ten sam e-mail z ostatnich 10 minut
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: dup } = await db
    .from("website_leads").select("id")
    .eq("email", row.email).gte("created_at", since).limit(1);
  if (dup && dup.length) return json({ ok: true, dedup: true, message: "Dziękujemy — odezwiemy się wkrótce." });

  const { data, error } = await db.from("website_leads").insert(row).select("id").single();
  if (error) return json({ error: error.message }, 400);

  return json({ ok: true, id: data?.id, message: "Dziękujemy za wiadomość — odezwiemy się wkrótce." });
});
