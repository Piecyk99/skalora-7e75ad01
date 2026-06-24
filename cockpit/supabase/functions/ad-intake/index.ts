// Agent „Wklej ogłoszenie" (Faza 3+). Pracownik wkleja TREŚĆ publicznego ogłoszenia/posta
// (np. z grupy FB, której jest członkiem, OLX, forum). Funkcja:
//   1) wyciąga firmę/ogłoszeniodawcę i publiczne dane kontaktowe (Anthropic, structured output),
//   2) tworzy prospekt (zrodlo='ad_paste') + draft outreach nawiązujący do ogłoszenia.
// Bez web search, bez scrapingu — to ręczny, świadomy wsad pracownika (zgodne z prawem).
// RODO: zapisujemy tylko to, co pracownik wkleił + ewentualny URL źródła (proweniencja).
//
// Wywołanie (POST, JWT pracownika): { "text": "<treść ogłoszenia>", "url"?: "<link>" }

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ENV_ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-4-8";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...cors, "content-type": "application/json" } });

async function resolveAnthropicKey(db: ReturnType<typeof createClient>): Promise<string | undefined> {
  if (ENV_ANTHROPIC_KEY) return ENV_ANTHROPIC_KEY;
  try { const { data } = await db.rpc("get_anthropic_key"); return (data as string) || undefined; } catch { return undefined; }
}

// Bramka: zalogowany pracownik (token + rola). Bez wariantu cron — to akcja ręczna.
async function authorize(req: Request, db: ReturnType<typeof createClient>): Promise<boolean> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const { data: u } = await db.auth.getUser(token);
  const uid = u?.user?.id;
  if (!uid) return false;
  const { data: roles } = await db.from("user_roles").select("role").eq("user_id", uid).limit(1);
  return (roles ?? []).length > 0;
}

interface Extracted {
  firma_nazwa: string;
  osoba_kontakt?: string;
  email?: string;
  telefon?: string;
  www?: string;
  miasto?: string;
  signal_type?: string;
  temat: string;
  tresc: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);
  if (!(await authorize(req, db))) return json({ error: "Brak uprawnień" }, 401);

  const apiKey = await resolveAnthropicKey(db);
  if (!apiKey) return json({ error: "Brak klucza AI — funkcja wymaga skonfigurowanego ANTHROPIC_API_KEY." }, 400);

  let body: { text?: string; url?: string } = {};
  try { body = await req.json(); } catch { /* puste body */ }
  const text = (body.text ?? "").trim();
  const url = (body.url ?? "").trim() || null;
  if (text.length < 20) return json({ error: "Wklej treść ogłoszenia (min. 20 znaków)." }, 400);

  // Jedno wywołanie: ekstrakcja danych + draft maila (structured output).
  let ex: Extracted;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 900,
        system:
          "Jesteś asystentem B2B Skalora (wdrożenia CRM). Z wklejonej treści ogłoszenia/posta wyciągasz dane " +
          "ogłoszeniodawcy (nazwa firmy lub osoby, publiczne dane kontaktowe widoczne w treści) oraz piszesz krótki, " +
          "rzeczowy draft pierwszego maila po polsku, nawiązujący konkretnie do tego ogłoszenia, z CTA na krótką rozmowę. " +
          "NIE zmyślaj danych kontaktowych — jeśli e-maila/telefonu nie ma w treści, pomiń pole. " +
          "Jeśli nie ma wyraźnej nazwy firmy, użyj sensownego opisu ogłoszeniodawcy jako firma_nazwa.",
        output_config: {
          format: {
            type: "json_schema",
            schema: {
              type: "object",
              properties: {
                firma_nazwa: { type: "string", description: "Nazwa firmy/ogłoszeniodawcy" },
                osoba_kontakt: { type: "string" },
                email: { type: "string" },
                telefon: { type: "string" },
                www: { type: "string" },
                miasto: { type: "string" },
                signal_type: { type: "string", description: "szuka_wykonawcy|oglasza_usluge|pyta_o_oferte|inne" },
                temat: { type: "string", description: "Temat maila, max ~80 znaków" },
                tresc: { type: "string", description: "Treść maila, 80-150 słów, nawiązuje do ogłoszenia" },
              },
              required: ["firma_nazwa", "temat", "tresc"],
              additionalProperties: false,
            },
          },
        },
        messages: [
          { role: "user", content: `Treść ogłoszenia${url ? ` (źródło: ${url})` : ""}:\n"""\n${text.slice(0, 6000)}\n"""` },
        ],
      }),
    });
    if (!res.ok) return json({ error: `Anthropic ${res.status}: ${(await res.text()).slice(0, 400)}` }, 502);
    const data = await res.json();
    if (data.stop_reason === "refusal") return json({ error: "Model odmówił (refusal)." }, 422);
    const out = (data.content ?? []).find((b: { type: string }) => b.type === "text")?.text ?? "{}";
    const parsed = JSON.parse(out);
    ex = {
      firma_nazwa: String(parsed.firma_nazwa ?? "").trim(),
      osoba_kontakt: parsed.osoba_kontakt ?? undefined,
      email: parsed.email ?? undefined,
      telefon: parsed.telefon ?? undefined,
      www: parsed.www ?? undefined,
      miasto: parsed.miasto ?? undefined,
      signal_type: parsed.signal_type ?? undefined,
      temat: String(parsed.temat ?? ""),
      tresc: String(parsed.tresc ?? ""),
    };
  } catch (e) {
    return json({ error: `Błąd wywołania AI: ${(e as Error).message}` }, 502);
  }

  if (!ex.firma_nazwa) return json({ error: "AI nie rozpoznało ogłoszeniodawcy — popraw treść i spróbuj ponownie." }, 422);

  // Insert prospektu.
  const { data: prospect, error: pErr } = await db.from("prospects").insert({
    firma_nazwa: ex.firma_nazwa,
    nip: null,
    zrodlo: "ad_paste",
    status: "nowy",
    raw_data: {
      branza: "domy szkieletowe/modułowe",
      miasto: ex.miasto ?? null,
      www: ex.www ?? null,
      email: ex.email ?? null,
      telefon: ex.telefon ?? null,
      osoba_kontakt: ex.osoba_kontakt ?? null,
      post_url: url,
      post_excerpt: text.slice(0, 500),
      signal_type: ex.signal_type ?? null,
    },
  }).select("id, firma_nazwa").single();
  if (pErr) return json({ error: pErr.message }, 400);

  // Insert draftu outreach podpiętego pod prospekt.
  const { data: draft, error: dErr } = await db.from("outreach").insert({
    prospect_id: prospect!.id,
    kierunek: "wychodzacy",
    status: "draft",
    temat: ex.temat,
    tresc: ex.tresc,
  }).select("id, temat").single();
  if (dErr) return json({ error: dErr.message, prospect }, 400);

  return json({ engine: "claude", model: ANTHROPIC_MODEL, prospect, draft });
});
