// Agent-copywriter (Faza 3b). Generuje DRAFTY maili outreach dla partner_leads.
// - Pisze do outreach przez service_role (status 'draft'). NIE wysyła maili.
// - Tekst: Anthropic Messages API (claude-opus-4-8, structured output) jeśli jest
//   ANTHROPIC_API_KEY; w przeciwnym razie deterministyczny szablon.
// - Tworzy draft tylko dla leadów, które nie mają jeszcze żadnego outreachu.
//
// Wywołanie (POST, wymaga JWT pracownika): { "limit": 10 }

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-4-8";

interface Draft { temat: string; tresc: string }

async function draftWithClaude(lead: Record<string, unknown>): Promise<Draft> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 700,
      system:
        "Jesteś copywriterem B2B DP DYNEX. Piszesz krótki, konkretny, spersonalizowany pierwszy mail " +
        "z propozycją wdrożenia CRM. Ton rzeczowy, po polsku. Bez nachalnej sprzedaży, z jasnym CTA na krótką rozmowę. " +
        "Bez zmyślania faktów o firmie.",
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              temat: { type: "string", description: "Temat maila, max ~80 znaków" },
              tresc: { type: "string", description: "Treść maila, 80-150 słów" },
            },
            required: ["temat", "tresc"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        { role: "user", content: `Napisz draft pierwszego maila do firmy:\n${JSON.stringify({
          firma_nazwa: lead.firma_nazwa, osoba_kontakt: lead.osoba_kontakt, status: lead.status,
        })}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data.stop_reason === "refusal") throw new Error("Anthropic refusal");
  const text = (data.content ?? []).find((b: { type: string }) => b.type === "text")?.text ?? "{}";
  const parsed = JSON.parse(text);
  return { temat: String(parsed.temat ?? ""), tresc: String(parsed.tresc ?? "") };
}

function draftTemplate(lead: Record<string, unknown>): Draft {
  const firma = String(lead.firma_nazwa ?? "Państwa firma");
  const osoba = lead.osoba_kontakt ? `Dzień dobry, ${lead.osoba_kontakt},` : "Dzień dobry,";
  return {
    temat: `Uporządkowanie sprzedaży w ${firma} — wdrożenie CRM`,
    tresc:
      `${osoba}\n\nW DP DYNEX pomagamy firmom takim jak ${firma} poukładać proces sprzedaży i pozysk leadów we wdrożonym CRM — ` +
      `od pierwszego kontaktu po podpisanie umowy. Zwykle skraca to czas reakcji na zapytania i porządkuje ofertowanie.\n\n` +
      `Czy znajdą Państwo 15 minut na krótką rozmowę w przyszłym tygodniu? Chętnie pokażę demo dopasowane do Państwa procesu.\n\n` +
      `Pozdrawiam,\nZespół DP DYNEX`,
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);

  let body: { limit?: number } = {};
  try { body = await req.json(); } catch { /* puste body OK */ }
  const limit = Math.min(Math.max(Number(body.limit ?? 10), 1), 50);

  // leady do których jeszcze nie ma outreachu
  const { data: existing } = await db.from("outreach").select("partner_lead_id").not("partner_lead_id", "is", null);
  const withDraft = new Set((existing ?? []).map((r) => r.partner_lead_id as string));
  const { data: leads, error } = await db
    .from("partner_leads").select("*").in("status", ["nowy", "kontakt"]).limit(200);
  if (error) return Response.json({ error: error.message }, { status: 400 });

  const targets = (leads ?? []).filter((l) => !withDraft.has(l.id as string)).slice(0, limit);

  const engine = ANTHROPIC_API_KEY ? "claude" : "template";
  const results: Array<Record<string, unknown>> = [];
  for (const lead of targets) {
    let d: Draft;
    try { d = ANTHROPIC_API_KEY ? await draftWithClaude(lead) : draftTemplate(lead); }
    catch (e) { d = { ...draftTemplate(lead), temat: draftTemplate(lead).temat + ` (LLM błąd: ${(e as Error).message})` }; }
    const { data: ins, error: insErr } = await db.from("outreach").insert({
      partner_lead_id: lead.id, kierunek: "wychodzacy", status: "draft", temat: d.temat, tresc: d.tresc,
    }).select("id").single();
    if (insErr) { results.push({ lead_id: lead.id, error: insErr.message }); continue; }
    results.push({ outreach_id: ins?.id, lead: lead.firma_nazwa, temat: d.temat });
  }

  return Response.json({ engine, model: engine === "claude" ? ANTHROPIC_MODEL : null,
    drafted: results.length, results });
});
