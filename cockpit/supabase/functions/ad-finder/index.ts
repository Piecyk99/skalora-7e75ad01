// Agent-szukacz OGŁOSZEŃ (Faza 3+). W odróżnieniu od lead-finder (szuka firm w niszy)
// ten agent szuka w PUBLICZNYM internecie SYGNAŁÓW POPYTU: ktoś szuka wykonawcy/ogłasza
// budowę/pyta o dom modułowy/szkieletowy. Tworzy prospekty (zrodlo='ad_search') i — opcjonalnie —
// drafty outreach nawiązujące do ogłoszenia.
// - Web search po stronie Anthropic (web_search_20260209). Tylko publiczne, widoczne źródła.
// - NIE loguje się do FB i NIE scrapuje treści za logowaniem. NIE wysyła maili.
// - RODO: minimalizacja — tylko publiczne dane kontaktowe firmowe + URL źródła dla proweniencji.
//
// Wywołanie (POST): JWT pracownika (front) albo x-cron-secret (cron).
//   { "nisza"?: "...", "limit"?: 10, "create_drafts"?: true }

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
  "domy szkieletowe, domy modułowe, prefabrykaty drewniane, budowa domu z drewna w Polsce";

interface Found {
  firma_nazwa: string;
  osoba_kontakt?: string;
  miasto?: string;
  www?: string;
  email?: string;
  telefon?: string;
  post_url?: string;
  post_excerpt?: string;
  signal_type?: string; // np. "szuka_wykonawcy" | "oglasza_usluge" | "pyta_o_oferte"
  uzasadnienie?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);
  if (!(await authorize(req, db))) return json({ error: "Brak uprawnień" }, 401);

  const apiKey = await resolveAnthropicKey(db);
  if (!apiKey) return json({ error: "Brak klucza AI — szukacz wymaga skonfigurowanego ANTHROPIC_API_KEY." }, 400);

  let body: { nisza?: string; limit?: number; create_drafts?: boolean } = {};
  try { body = await req.json(); } catch { /* puste body OK */ }
  const nisza = (body.nisza && body.nisza.trim()) ? body.nisza.trim() : DEFAULT_NISZA;
  const limit = Math.min(Math.max(Number(body.limit ?? 10), 1), 25);
  const createDrafts = body.create_drafts === true;

  const system =
    "Jesteś researcherem B2B dla Skalora (wdrożenia CRM). Szukasz w PUBLICZNYM internecie OGŁOSZEŃ i POSTÓW, " +
    "w których ktoś sygnalizuje popyt w podanej niszy: szuka wykonawcy, ogłasza usługę, pyta o ofertę, planuje budowę. " +
    "Korzystaj z web search (publiczne strony i posty FB widoczne bez logowania, OLX, fora, Google, Marketplace). " +
    "Dla każdego sygnału podaj nazwę firmy lub ogłoszeniodawcy, link do publicznego źródła (post_url), krótki cytat (post_excerpt) " +
    "oraz TYLKO publiczne dane kontaktowe widoczne w wynikach (www, e-mail firmowy biuro@/kontakt@, telefon, miasto). " +
    "Nie zmyślaj e-maili, telefonów ani NIP — pomiń pole, jeśli brak pewnej danej. Zwróć WYŁĄCZNIE poprawny JSON.";
  const userMsg =
    `Znajdź do ${limit} publicznych ogłoszeń/postów z sygnałem popytu w niszy: ${nisza}.\n\n` +
    `Zwróć wyłącznie tablicę JSON (bez komentarzy, bez markdown) w formacie:\n` +
    `[{"firma_nazwa":"...","osoba_kontakt":"...","miasto":"...","www":"...","email":"...","telefon":"...",` +
    `"post_url":"...","post_excerpt":"...","signal_type":"szuka_wykonawcy|oglasza_usluge|pyta_o_oferte","uzasadnienie":"..."}]\n` +
    `Pola opcjonalne pomiń, jeśli brak pewnych danych. "post_url" i "post_excerpt" podaj zawsze, gdy to możliwe. ` +
    `"uzasadnienie" to 1 zdanie, czemu to dobry trop pod wdrożenie CRM lub współpracę.`;

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
  if (found.length === 0) return json({ engine: "claude", model: ANTHROPIC_MODEL, found: 0, inserted: 0, drafted: 0, results: [] });

  // Dedup po nazwie (case-insensitive) względem istniejących prospektów.
  const names = found.map((c) => c.firma_nazwa.trim());
  const { data: existing } = await db.from("prospects").select("firma_nazwa").in("firma_nazwa", names);
  const have = new Set((existing ?? []).map((r) => String(r.firma_nazwa).toLowerCase()));

  const fresh = found.filter((c) => !have.has(c.firma_nazwa.trim().toLowerCase()));
  const rows = fresh.map((c) => ({
    firma_nazwa: c.firma_nazwa.trim(),
    nip: null,
    zrodlo: "ad_search",
    status: "nowy",
    raw_data: {
      branza: nisza,
      miasto: c.miasto ?? null,
      www: c.www ?? null,
      email: c.email ?? null,
      telefon: c.telefon ?? null,
      osoba_kontakt: c.osoba_kontakt ?? null,
      post_url: c.post_url ?? null,
      post_excerpt: c.post_excerpt ?? null,
      signal_type: c.signal_type ?? null,
      finder_rationale: c.uzasadnienie ?? null,
    },
  }));

  let inserted = 0;
  let drafted = 0;
  if (rows.length) {
    // Insert + zwrot id, by móc podpiąć drafty outreach.
    const { data: ins, error } = await db.from("prospects").insert(rows).select("id, firma_nazwa, raw_data");
    if (error) return json({ error: error.message }, 400);
    inserted = (ins ?? []).length;

    if (createDrafts && ins?.length) {
      const drafts = ins.map((p) => {
        const rd = (p.raw_data ?? {}) as Record<string, unknown>;
        const excerpt = (rd.post_excerpt as string) || "";
        const url = (rd.post_url as string) || "";
        return {
          prospect_id: p.id,
          kierunek: "wychodzacy",
          status: "draft",
          temat: `Nawiązanie do ogłoszenia — ${p.firma_nazwa}`,
          tresc:
            `Dzień dobry,\n\nnatrafiliśmy na Państwa ogłoszenie${excerpt ? ` („${excerpt.slice(0, 140)}”)` : ""}` +
            `${url ? `\nŹródło: ${url}` : ""}.\n\n` +
            `W Skalorze pomagamy firmom z branży domów modułowych/szkieletowych uporządkować obsługę zapytań i sprzedaż we wdrożonym CRM. ` +
            `Czy znajdą Państwo 15 minut na krótką rozmowę? Chętnie pokażę demo dopasowane do Państwa procesu.\n\n` +
            `Pozdrawiam,\nZespół Skalora`,
        };
      });
      const { error: dErr, data: dIns } = await db.from("outreach").insert(drafts).select("id");
      if (!dErr) drafted = (dIns ?? []).length;
    }
  }

  return json({
    engine: "claude", model: ANTHROPIC_MODEL,
    found: found.length, inserted, drafted,
    results: rows.map((r) => ({
      firma_nazwa: r.firma_nazwa,
      signal_type: r.raw_data.signal_type,
      post_url: r.raw_data.post_url,
    })),
  });
});
