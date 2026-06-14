import type { PartnerStatus } from "@/integrations/supabase/types";
import { PARTNER_STATUS_BADGE, PARTNER_STATUS_LABEL } from "@/lib/partnerStatus";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: PartnerStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", PARTNER_STATUS_BADGE[status])}>
      {PARTNER_STATUS_LABEL[status]}
    </span>
  );
}
