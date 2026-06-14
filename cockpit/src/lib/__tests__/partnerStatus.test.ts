import { describe, it, expect } from "vitest";
import { allowedNextStatuses, PARTNER_STATUS_ORDER } from "@/lib/partnerStatus";
import type { PartnerStatus } from "@/integrations/supabase/types";

// Lustro grafu przejść z DB (partner_status_can_transition / rpc_partner_lifecycle).
// Ten zestaw chroni spójność UI z autorytatywną walidacją w bazie. Pełny test
// rzeczywistego RPC żyje w src/test/integration/rpcPartnerLifecycle.test.ts.
const EXPECTED: Record<PartnerStatus, PartnerStatus[]> = {
  nowy: ["kontakt", "odrzucony"],
  kontakt: ["demo_crm", "odrzucony"],
  demo_crm: ["umowa_wdrozeniowa", "odrzucony"],
  umowa_wdrozeniowa: ["onboarding", "odrzucony"],
  onboarding: ["wygrany", "odrzucony"],
  wygrany: [],
  odrzucony: ["nowy"],
};

const ALL = Object.keys(EXPECTED) as PartnerStatus[];

describe("partner_status — dozwolone przejścia", () => {
  it("zna wszystkie 7 statusów", () => {
    expect(PARTNER_STATUS_ORDER.slice().sort()).toEqual(ALL.slice().sort());
  });

  for (const from of ALL) {
    it(`z "${from}" dozwala dokładnie ${JSON.stringify(EXPECTED[from])}`, () => {
      expect(allowedNextStatuses(from).slice().sort()).toEqual(EXPECTED[from].slice().sort());
    });
  }
});

describe("partner_status — niedozwolone przejścia", () => {
  const cases: [PartnerStatus, PartnerStatus][] = [
    ["nowy", "onboarding"], // przeskok etapów
    ["nowy", "wygrany"],
    ["nowy", "demo_crm"],
    ["kontakt", "onboarding"],
    ["kontakt", "wygrany"],
    ["demo_crm", "onboarding"], // pominięcie umowy
    ["demo_crm", "wygrany"],
    ["umowa_wdrozeniowa", "wygrany"], // pominięcie onboardingu
    ["wygrany", "nowy"], // terminal — brak wyjścia
    ["wygrany", "odrzucony"],
    ["odrzucony", "kontakt"], // reaktywacja tylko do "nowy"
    ["odrzucony", "wygrany"],
  ];

  for (const [from, to] of cases) {
    it(`blokuje "${from}" -> "${to}"`, () => {
      expect(allowedNextStatuses(from)).not.toContain(to);
    });
  }

  it("żaden status nie pozwala na przejście do samego siebie (no-op obsługuje RPC)", () => {
    for (const s of ALL) expect(allowedNextStatuses(s)).not.toContain(s);
  });
});
