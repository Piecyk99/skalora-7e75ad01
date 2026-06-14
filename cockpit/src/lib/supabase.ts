import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error(
    "Brak konfiguracji Supabase: ustaw VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY " +
      "(świeży, OSOBNY projekt dla cockpitu DP DYNEX — nie współdziel z istniejącymi).",
  );
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});
