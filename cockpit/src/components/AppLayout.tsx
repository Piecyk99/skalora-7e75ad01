import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, KanbanSquare, Radar, Mail, ShieldCheck, LogOut, Sun, Moon, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Cockpit", icon: LayoutDashboard, end: true, perm: "partner_leads.view" },
  { to: "/pipeline", label: "Pipeline pozysku", icon: KanbanSquare, perm: "partner_leads.view" },
  { to: "/prospects", label: "Prospects", icon: Radar, perm: "prospects.view" },
  { to: "/outreach", label: "Outreach", icon: Mail, perm: "outreach.view" },
  { to: "/admin", label: "Administracja", icon: ShieldCheck, perm: "admin.manage_roles" },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-skalora text-lg font-extrabold text-slate-950">S</span>
      <div>
        <div className="text-lg font-extrabold leading-none tracking-widest text-gradient-skalora">SKALORA</div>
        <div className="mt-1 text-[11px] text-muted-foreground">Cockpit operacyjny</div>
      </div>
    </div>
  );
}

function NavLinks({ canSee, onNavigate }: { canSee: (perm: string) => boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.filter((i) => canSee(i.perm)).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-gradient-skalora font-semibold text-slate-950"
                : "text-foreground hover:bg-muted",
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  const { user, roles, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  return (
    <div className="border-t p-3 text-xs">
      <div className="truncate font-medium">{user?.email}</div>
      <div className="mb-2 text-muted-foreground">{roles.join(", ") || "brak roli"}</div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={async () => {
            await signOut();
            navigate("/login");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Wyloguj
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 px-2"
          title={theme === "dark" ? "Tryb jasny" : "Tryb ciemny"}
          onClick={toggle}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export function AppLayout() {
  const { hasPermission } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 flex-col border-r bg-card md:flex">
        <div className="px-5 py-4">
          <Brand />
        </div>
        <NavLinks canSee={hasPermission} />
        <SidebarFooter />
      </aside>

      {/* Szuflada nawigacji — telefon */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="flex flex-col p-0">
          <SheetTitle className="px-5 py-4">
            <Brand />
          </SheetTitle>
          <NavLinks canSee={hasPermission} onNavigate={() => setMenuOpen(false)} />
          <SidebarFooter />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Górny pasek — telefon */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card/95 px-4 py-3 backdrop-blur md:hidden">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 px-2"
            onClick={() => setMenuOpen(true)}
            aria-label="Otwórz menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Brand />
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
