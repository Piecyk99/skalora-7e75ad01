// Agent-prospektor (Faza 3). Ocena ICP prospektów i kwalifikacja.
// - Czyta/pisze prospects przez service_role (auto-wstrzykiwane w Edge Runtime).
// - Scoring: Anthropic Messages API (claude-opus-4-8, structured output) jeśli ustawiony
//   ANTHROPIC_API_KEY; w przeciwnym razie deterministyczny fallback heurystyczny.
// - NIE wysyła maili; nie tworzy leadów (promocja to osobny, ludzki krok przez RPC).
//
// Wywołanie (POST, wymaga JWT zalogowanego pracownika):
//   { "companies": [{ "firma_nazwa": "...", "nip": "...", "zrodlo": "...", "raw_data": {...} }],
//     "limit": 10 }
// companies opcjonalne (jeśli podane — najpierw dograne jako prospects 'nowy').

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-4-8";
const QUALIFY_THRESHOLD = Number(Deno.env.get("ICP_THRESHOLD") ?? "60");

const ICP = `Profil idealnego klienta DP DYNEX (pozysk firm na wdrożenie CRM + partnerstwo):
- mała/średnia firma w Polsce (ok. 5–200 osób), usługowa lub handlowa,
- prowadzi aktywną sprzedaż B2B/B2C i pozyskuje leady,
- ma potrzebę uporządkowania sprzedaży/leadów/ofertowania,
- realny budżet na wdrożenie systemu.`;

interface Scored { score: number; qualified: boolean; rationale: string }

async function scoreWithClaude(p: Record<string, unknown>): Promise<Scored> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 512,
      system: `Jesteś analitykiem ICP. Oceniasz dopasowanie firmy do profilu i zwracasz wynik 0–100.\n${ICP}`,
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              score: { type: "integer", description: "Dopasowanie ICP 0-100" },
              qualified: { type: "boolean" },
              rationale: { type: "string", description: "Krótkie uzasadnienie po polsku" },
            },
            required: ["score", "qualified", "rationale"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        { role: "user", content: `Oceń firmę pod kątem ICP:\n${JSON.stringify({
          firma_nazwa: p.firma_nazwa, nip: p.nip, zrodlo: p.zrodlo, raw_data: p.raw_data,
        })}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data.stop_reason === "refusal") throw new Error("Anthropic refusal");
  const text = (data.content ?? []).find((b: { type: string }) => b.type === "text")?.text ?? "{}";
  const parsed = JSON.parse(text);
  return {
    score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
    qualified: Boolean(parsed.qualified),
    rationale: String(parsed.rationale ?? ""),
  };
}

// Fallback bez LLM — przejrzysta heurystyka po polach raw_data.
function scoreHeuristic(p: Record<string, unknown>): Scored {
  const raw = (p.raw_data ?? {}) as Record<string, unknown>;
  let score = 40;
  const emp = Number(raw.zatrudnienie ?? raw.employees ?? 0);
  if (emp >= 5 && emp <= 200) score += 25; else if (emp > 0) score += 5;
  if (p.nip) score += 10;
  const branza = String(raw.branza ?? raw.industry ?? "").toLowerCase();
  if (/usług|handel|service|retail|e-?commerce/.test(branza)) score += 20;
  if (raw.kraj && String(raw.kraj).toLowerCase().startsWith("pol")) score += 5;
  score = Math.max(0, Math.min(100, score));
  return { score, qualified: score >= QUALIFY_THRESHOLD,
    rationale: `Heurystyka: zatrudnienie=${emp || "?"}, NIP=${p.nip ? "tak" : "nie"}, branża="${branza || "?"}".` };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);

  let body: { companies?: Array<Record<string, unknown>>; limit?: number } = {};
  try { body = await req.json(); } catch { /* puste body OK */ }
  const limit = Math.min(Math.max(Number(body.limit ?? 10), 1), 50);

  // 1) dograj podane firmy jako prospects 'nowy'
  if (Array.isArray(body.companies) && body.companies.length > 0) {
    const rows = body.companies
      .filter((c) => c && String(c.firma_nazwa ?? "").trim() !== "")
      .map((c) => ({
        firma_nazwa: c.firma_nazwa, nip: c.nip ?? null,
        zrodlo: c.zrodlo ?? "prospect", raw_data: c.raw_data ?? {}, status: "nowy",
      }));
    if (rows.length) {
      const { error } = await db.from("prospects").insert(rows);
      if (error) return Response.json({ error: error.message }, { status: 400 });
    }
  }

  // 2) pobierz prospekty do oceny
  const { data: pending, error: selErr } = await db
    .from("prospects").select("*").eq("status", "nowy").limit(limit);
  if (selErr) return Response.json({ error: selErr.message }, { status: 400 });

  // 3) oceń i zaktualizuj
  const engine = ANTHROPIC_API_KEY ? "claude" : "heuristic";
  const results: Array<Record<string, unknown>> = [];
  for (const p of pending ?? []) {
    let s: Scored;
    try { s = ANTHROPIC_API_KEY ? await scoreWithClaude(p) : scoreHeuristic(p); }
    catch (e) { s = { ...scoreHeuristic(p), rationale: `LLM błąd, użyto heurystyki: ${(e as Error).message}` }; }
    const status = s.qualified ? "zakwalifikowany" : "odrzucony";
    await db.from("prospects").update({
      icp_score: s.score, status,
      raw_data: { ...((p.raw_data as object) ?? {}), icp_rationale: s.rationale },
    }).eq("id", p.id);
    results.push({ id: p.id, firma_nazwa: p.firma_nazwa, score: s.score, status });
  }

  return Response.json({ engine, model: engine === "claude" ? ANTHROPIC_MODEL : null,
    evaluated: results.length, results });
});
