import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Testy integracyjne (RLS/RPC) wymagają żywego Postgresa Supabase i są
    // pomijane (skipIf) gdy brak COCKPIT_TEST_SUPABASE_URL — patrz src/test/integration.
    testTimeout: 30000,
  },
});
