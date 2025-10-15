
import { useLocation } from "wouter";
import { Home, CreditCard, TrendingUp, User } from "lucide-react";

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/bills", icon: CreditCard, label: "Contas" },
    { path: "/reports", icon: TrendingUp, label: "Relatórios" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className={`nav-item ${location === path ? "active" : ""}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
