import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, isStaff, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030305] text-gray-400">
        Ładowanie...
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (!isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#030305] px-4 text-center text-white">
        <h1 className="text-xl font-semibold">Brak dostępu</h1>
        <p className="max-w-sm text-sm text-gray-400">
          Twoje konto nie ma uprawnień do panelu CRM. Poproś administratora o nadanie dostępu.
        </p>
        <button
          onClick={signOut}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5"
        >
          Wyloguj
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
