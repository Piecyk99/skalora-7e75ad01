import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";

// Route guard: wymaga zalogowania. Opcjonalnie wymaga konkretnego permission_key.
export function RequireAuth({
  children,
  permission,
}: {
  children: ReactNode;
  permission?: string;
}) {
  const { session, loading, hasPermission, isStaff } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Ładowanie…</div>;
  }
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold">Brak uprawnień</p>
        <p className="text-sm text-muted-foreground">
          {isStaff
            ? "Twoja rola nie ma dostępu do tej sekcji."
            : "Twoje konto nie ma jeszcze przypisanej żadnej roli. Skontaktuj się z administratorem."}
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
