import type { PartnerStatus } from "@/integrations/supabase/types";

// SSOT prezentacji + lustro grafu przejść z DB (partner_status_can_transition).
// DB pozostaje autorytatywna — UI tylko podpowiada dozwolone opcje.
export const PARTNER_STATUS_ORDER: PartnerStatus[] = [
  "nowy",
  "kontakt",
  "demo_crm",
  "umowa_wdrozeniowa",
  "onboarding",
  "wygrany",
  "odrzucony",
];

export const PARTNER_STATUS_LABEL: Record<PartnerStatus, string> = {
  nowy: "Nowy",
  kontakt: "Kontakt",
  demo_crm: "Demo CRM",
  umowa_wdrozeniowa: "Umowa wdrożeniowa",
  onboarding: "Onboarding",
  wygrany: "Wygrany",
  odrzucony: "Odrzucony",
};

// Styl badge per status (klasy Tailwind).
export const PARTNER_STATUS_BADGE: Record<PartnerStatus, string> = {
  nowy: "bg-slate-100 text-slate-700",
  kontakt: "bg-blue-100 text-blue-700",
  demo_crm: "bg-indigo-100 text-indigo-700",
  umowa_wdrozeniowa: "bg-amber-100 text-amber-700",
  onboarding: "bg-purple-100 text-purple-700",
  wygrany: "bg-green-100 text-green-700",
  odrzucony: "bg-red-100 text-red-700",
};

const TRANSITIONS: Record<PartnerStatus, PartnerStatus[]> = {
  nowy: ["kontakt", "odrzucony"],
  kontakt: ["demo_crm", "odrzucony"],
  demo_crm: ["umowa_wdrozeniowa", "odrzucony"],
  umowa_wdrozeniowa: ["onboarding", "odrzucony"],
  onboarding: ["wygrany", "odrzucony"],
  wygrany: [],
  odrzucony: ["nowy"],
};

export function allowedNextStatuses(from: PartnerStatus): PartnerStatus[] {
  return TRANSITIONS[from] ?? [];
}
