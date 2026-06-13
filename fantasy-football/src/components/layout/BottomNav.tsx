import { NavLink } from "react-router-dom";
import { Trophy, Users, Shield, LayoutDashboard, UserCircle } from "lucide-react";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

export default function BottomNav() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();

  const links = [
    { to: "/", label: t("nav.season"), icon: LayoutDashboard },
    { to: "/players", label: t("nav.players"), icon: Users },
    { to: "/clubs", label: t("nav.clubs"), icon: Shield },
    { to: "/leaderboard", label: t("nav.leaderboard"), icon: Trophy },
    { to: "/dashboard", label: t("nav.dashboard"), icon: UserCircle, dot: isLoggedIn },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur border-t border-gray-800">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map(({ to, label, icon: Icon, dot }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-green-400" : "text-gray-500"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={clsx(
                  "p-1.5 rounded-xl transition-colors",
                  isActive ? "bg-green-500/15" : ""
                )}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-medium leading-none">{label}</span>
                {dot && (
                  <span className="absolute top-2 right-[calc(50%-12px)] w-2 h-2 bg-green-400 rounded-full border-2 border-gray-950" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* Safe area for phones with home indicator */}
      <div className="h-safe-bottom bg-gray-950" />
    </nav>
  );
}
