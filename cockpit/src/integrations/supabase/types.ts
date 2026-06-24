// Typy domenowe cockpitu DP DYNEX. W docelowym workflow regeneruj przez
// `supabase gen types typescript` po podłączeniu świeżego projektu. Tu utrzymane
// ręcznie i zgodne ze schematem z supabase/migrations.

export type AppRole = "admin" | "handlowiec_pozysk" | "viewer";

export type PartnerStatus =
  | "nowy"
  | "kontakt"
  | "demo_crm"
  | "umowa_wdrozeniowa"
  | "onboarding"
  | "wygrany"
  | "odrzucony";

export type PartnerSource = "reczny" | "prospect" | "import";
export type ProspectStatus = "nowy" | "zakwalifikowany" | "odrzucony" | "promowany";
export type OutreachStatus = "draft" | "approved" | "sent" | "bounced" | "replied";
export type OutreachDirection = "wychodzacy" | "przychodzacy";
export type ConsentCel = "wdrozenie_crm" | "finansowanie";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

export interface PartnerLead {
  id: string;
  firma_nazwa: string;
  nip: string | null;
  osoba_kontakt: string | null;
  email: string | null;
  telefon: string | null;
  status: PartnerStatus;
  assigned_to: string | null;
  next_action_date: string | null;
  next_action_type: string | null;
  kontrakt_wartosc: number | null;
  prowizja_pct: number | null;
  source: PartnerSource;
  prospect_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prospect {
  id: string;
  firma_nazwa: string;
  nip: string | null;
  zrodlo: string | null;
  icp_score: number | null;
  raw_data: Record<string, unknown>;
  status: ProspectStatus;
  promoted_to_lead: string | null;
  created_at: string;
}

export interface Outreach {
  id: string;
  prospect_id: string | null;
  partner_lead_id: string | null;
  kierunek: OutreachDirection;
  temat: string | null;
  tresc: string | null;
  status: OutreachStatus;
  approved_by: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  entity_type: string;
  entity_id: string;
  event_type: string;
  old_value: string | null;
  new_value: string | null;
  actor_id: string | null;
  created_at: string;
}

export interface ExternalTask {
  id: string;
  source: string;
  external_id: string;
  tytul: string | null;
  status: string | null;
  due_date: string | null;
  payload: Record<string, unknown>;
  synced_at: string;
}

// Kształt zgodny z GenericSchema supabase-js (Tables/Views/Functions/Enums/CompositeTypes,
// każda tabela z Relationships) — bez tego rpc() rozwiązuje argumenty do `never`.
type Tbl<R, I = Partial<R>, U = Partial<R>> = { Row: R; Insert: I; Update: U; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: Tbl<Profile>;
      partner_leads: Tbl<PartnerLead>;
      prospects: Tbl<Prospect>;
      outreach: Tbl<Outreach>;
      activity_log: Tbl<ActivityLog>;
      external_tasks: Tbl<ExternalTask>;
      user_roles: Tbl<{ id: string; user_id: string; role: AppRole; created_at: string }, { user_id: string; role: AppRole }>;
      role_permissions: Tbl<{ id: string; role: AppRole; permission_key: string }, { role: AppRole; permission_key: string }>;
    };
    Views: Record<string, never>;
    Functions: {
      rpc_partner_lifecycle: {
        Args: { p_lead_id: string; p_new_status: PartnerStatus; p_note?: string | null };
        Returns: PartnerLead;
      };
      rpc_create_partner_lead: {
        Args: {
          p_firma_nazwa: string;
          p_nip?: string | null;
          p_osoba_kontakt?: string | null;
          p_email?: string | null;
          p_telefon?: string | null;
          p_next_action_date?: string | null;
          p_next_action_type?: string | null;
          p_kontrakt_wartosc?: number | null;
          p_prowizja_pct?: number | null;
          p_consent_wdrozenie?: boolean;
          p_consent_finansowanie?: boolean;
          p_consent_tresc?: string | null;
          p_consent_wersja?: string;
        };
        Returns: PartnerLead;
      };
      bootstrap_first_admin: { Args: Record<string, never>; Returns: undefined };
      rpc_add_prospect: {
        Args: { p_firma_nazwa: string; p_nip?: string | null; p_zrodlo?: string; p_raw_data?: Record<string, unknown> };
        Returns: Prospect;
      };
      rpc_set_prospect_status: {
        Args: { p_id: string; p_status: ProspectStatus; p_score?: number | null };
        Returns: Prospect;
      };
      rpc_promote_prospect: { Args: { p_id: string }; Returns: PartnerLead };
      rpc_update_outreach: { Args: { p_id: string; p_temat: string; p_tresc: string }; Returns: Outreach };
      rpc_approve_outreach: { Args: { p_id: string }; Returns: Outreach };
    };
    Enums: {
      app_role: AppRole;
      partner_status: PartnerStatus;
      partner_source: PartnerSource;
      prospect_status: ProspectStatus;
      outreach_status: OutreachStatus;
      outreach_direction: OutreachDirection;
      consent_cel: ConsentCel;
    };
    CompositeTypes: Record<string, never>;
  };
}
