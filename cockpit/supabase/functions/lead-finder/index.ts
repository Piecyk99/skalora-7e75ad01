// Agent-szukacz (Faza 3+). Znajduje w sieci małe/średnie firmy w niszy (domy szkieletowe/
// modułowe, prefabrykaty drewniane, mali wykonawcy) i dograje je jako prospects 'nowy'.
// - Web search po stronie Anthropic (tool web_search_20260209, GA na Opus 4.8).
// - NIE wysyła maili i NIE tworzy leadów — to human-in-the-loop: prospekt -> ocena -> promocja.
//
// Wywołanie (POST): JWT pracownika (front) albo x-cron-secret (cron).
//   { "nisza": "...", "limit": 10 }

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

// Bramka: cron (x-cron-secret) albo zalogowany pracownik (token + rola).
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

const DEFAULT_NISZA =
  "małe i średnie firmy w Polsce z branży: domy szkieletowe, domy modułowe, prefabrykaty drewniane, " +
  "mali producenci/wykonawcy domów z drewna (5–200 osób)";

interface Found { firma_nazwa: string; miasto?: string; www?: string; email?: string; nip?: string; uzasadnienie?: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);
  if (!(await authorize(req, db))) return json({ error: "Brak uprawnień" }, 401);

  const apiKey = await resolveAnthropicKey(db);
  if (!apiKey) return json({ error: "Brak klucza AI — szukacz wymaga skonfigurowanego ANTHROPIC_API_KEY." }, 400);

  let body: { nisza?: string; limit?: number } = {};
  try { body = await req.json(); } catch { /* puste body OK */ }
  const nisza = (body.nisza && body.nisza.trim()) ? body.nisza.trim() : DEFAULT_NISZA;
  const limit = Math.min(Math.max(Number(body.limit ?? 10), 1), 25);

  const system =
    "Jesteś researcherem B2B dla Skalora (wdrożenia CRM). Szukasz w internecie realnych, istniejących firm " +
    "w podanej niszy. Korzystaj z web search. Dla każdej firmy podaj TYLKO informacje publiczne i potwierdzone " +
    "w wynikach (nazwa, miasto, strona www, publiczny adres e-mail typu biuro@/kontakt@ jeśli widoczny, NIP jeśli widoczny). " +
    "Nie zmyślaj adresów e-mail ani NIP — jeśli nie ma, pomiń pole. Zwróć WYŁĄCZNIE poprawny JSON.";
  const userMsg =
    `Znajdź do ${limit} firm pasujących do niszy: ${nisza}.\n\n` +
    `Zwróć wyłącznie tablicę JSON (bez komentarzy, bez markdown) w formacie:\n` +
    `[{"firma_nazwa":"...","miasto":"...","www":"...","email":"...","nip":"...","uzasadnienie":"..."}]\n` +
    `Pola www/email/nip/miasto są opcjonalne — pomiń, jeśli brak pewnych danych. ` +
    `"uzasadnienie" to 1 zdanie czemu firma pasuje do profilu (klient na wdrożenie CRM).`;

  // Pętla obsługująca server-tool (web search) i ewentualny pause_turn.
  const messages: Array<Record<string, unknown>> = [{ role: "user", content: userMsg }];
  let finalText = "";
  try {
    for (let i = 0; i < 4; i++) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 4096,
          system,
          tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
          messages,
        }),
      });
      if (!res.ok) return json({ error: `Anthropic ${res.status}: ${(await res.text()).slice(0, 400)}` }, 502);
      const data = await res.json();
      if (data.stop_reason === "refusal") return json({ error: "Model odmówił (refusal)." }, 422);
      messages.push({ role: "assistant", content: data.content });
      if (data.stop_reason === "pause_turn") continue; // server kontynuuje wyszukiwanie
      finalText = (data.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n");
      break;
    }
  } catch (e) {
    return json({ error: `Błąd wywołania AI: ${(e as Error).message}` }, 502);
  }

  // Wyłuskaj tablicę JSON z odpowiedzi.
  let found: Found[] = [];
  const m = finalText.match(/\[[\s\S]*\]/);
  if (m) { try { found = JSON.parse(m[0]); } catch { /* nieparsowalne */ } }
  found = (Array.isArray(found) ? found : []).filter((c) => c && String(c.firma_nazwa ?? "").trim() !== "");
  if (found.length === 0) return json({ engine: "claude", model: ANTHROPIC_MODEL, found: 0, inserted: 0, results: [] });

  // Dedup po nazwie (case-insensitive) względem istniejących prospektów.
  const names = found.map((c) => c.firma_nazwa.trim());
  const { data: existing } = await db.from("prospects").select("firma_nazwa").in("firma_nazwa", names);
  const have = new Set((existing ?? []).map((r) => String(r.firma_nazwa).toLowerCase()));

  const rows = found
    .filter((c) => !have.has(c.firma_nazwa.trim().toLowerCase()))
    .map((c) => ({
      firma_nazwa: c.firma_nazwa.trim(),
      nip: c.nip ? String(c.nip).trim() : null,
      zrodlo: "ai_search",
      status: "nowy",
      raw_data: {
        branza: "domy szkieletowe/modułowe",
        miasto: c.miasto ?? null,
        www: c.www ?? null,
        email: c.email ?? null,
        finder_rationale: c.uzasadnienie ?? null,
      },
    }));

  let inserted = 0;
  if (rows.length) {
    const { error, count } = await db.from("prospects").insert(rows, { count: "exact" });
    if (error) return json({ error: error.message }, 400);
    inserted = count ?? rows.length;
  }

  return json({
    engine: "claude", model: ANTHROPIC_MODEL,
    found: found.length, inserted,
    results: rows.map((r) => ({ firma_nazwa: r.firma_nazwa, email: r.raw_data.email, www: r.raw_data.www })),
  });
});
