// Pixel open-tracking (publiczny, verify_jwt=false). GET ?o=<outreach_id>
// Zlicza otwarcie i zwraca przezroczysty 1x1 GIF. Zawsze 200.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// 1x1 przezroczysty GIF
const GIF = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0));

Deno.serve(async (req) => {
  const o = new URL(req.url).searchParams.get("o");
  if (o) {
    try {
      const db = createClient(SUPABASE_URL, SERVICE_ROLE);
      await db.rpc("bump_outreach_metric", { _id: o, _kind: "open" });
    } catch { /* nie blokuj odpowiedzi pixela */ }
  }
  return new Response(GIF, {
    status: 200,
    headers: { "content-type": "image/gif", "cache-control": "no-store, no-cache, must-revalidate, private" },
  });
});
