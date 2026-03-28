import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { LayoutDashboard, TicketIcon, LogOut, Sun, Moon, Settings, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const isIT = user?.role === "admin" || user?.role === "it";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const navItems = isIT
    ? [
        { path: "/", icon: LayoutDashboard, label: "Painel TI" },
        { path: "/tickets", icon: TicketIcon, label: "Chamados" },
      ]
    : [
        { path: "/", icon: LayoutDashboard, label: "Meus Chamados" },
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <TicketIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-foreground text-sm">Guararapes</span>
                <span className="text-xs text-muted-foreground">Help Desk</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? "bg-brand text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                <span className="text-xs font-bold text-brand">
                  {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-medium text-foreground">{user?.full_name || user?.email}</span>
                <span className="text-xs text-muted-foreground capitalize">{isIT ? "Técnico TI" : "Usuário"}</span>
              </div>
              <button
                // Implemente logout no backend REST se necessário
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}