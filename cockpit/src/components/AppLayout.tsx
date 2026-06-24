import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, KanbanSquare, Radar, Mail, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Cockpit", icon: LayoutDashboard, end: true, perm: "partner_leads.view" },
  { to: "/pipeline", label: "Pipeline pozysku", icon: KanbanSquare, perm: "partner_leads.view" },
  { to: "/prospects", label: "Prospects", icon: Radar, perm: "prospects.view" },
  { to: "/outreach", label: "Outreach", icon: Mail, perm: "outreach.view" },
  { to: "/admin", label: "Administracja", icon: ShieldCheck, perm: "admin.manage_roles" },
];

export function AppLayout() {
  const { user, roles, hasPermission, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="flex w-60 flex-col border-r bg-card">
        <div className="px-5 py-4">
          <div className="text-sm font-bold">Skalora</div>
          <div className="text-xs text-muted-foreground">Cockpit DP DYNEX</div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.filter((i) => hasPermission(i.perm)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3 text-xs">
          <div className="truncate font-medium">{user?.email}</div>
          <div className="mb-2 text-muted-foreground">{roles.join(", ") || "brak roli"}</div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={async () => {
              await signOut();
              navigate("/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Wyloguj
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
