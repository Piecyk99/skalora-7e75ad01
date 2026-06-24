import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Potwierdzenie usunięcia. Brak prymitywu alert-dialog — używamy Dialog + destructive Button.
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Potwierdź usunięcie",
  description,
  confirmLabel = "Usuń",
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button variant="destructive" className="w-full sm:w-auto" disabled={pending} onClick={onConfirm}>
            {pending ? "Usuwanie…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
