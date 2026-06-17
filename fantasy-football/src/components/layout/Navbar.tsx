import { NavLink } from "react-router-dom";
import { Trophy, Users, Shield, LayoutDashboard, UserCircle, ArrowLeftRight } from "lucide-react";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { isLoggedIn } = useAuth();

  const links = [
    { to: "/", label: t("nav.season"), icon: LayoutDashboard },
    { to: "/players", label: t("nav.players"), icon: Users },
    { to: "/clubs", label: t("nav.clubs"), icon: Shield },
    { to: "/leaderboard", label: t("nav.leaderboard"), icon: Trophy },
    ...(isLoggedIn
      ? [{ to: "/transfers", label: t("nav.transfers"), icon: ArrowLeftRight }]
      : []),
  ];

  const toggleLang = () => {
    const next = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              FP
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Football Plus Fantasy
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop nav — hidden on mobile (bottom nav takes over) */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-green-500/10 text-green-400"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    )
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}

              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  clsx(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-500/10 text-green-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )
                }
              >
                <UserCircle size={15} />
                {t("nav.dashboard")}
                {isLoggedIn && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-400 rounded-full" />
                )}
              </NavLink>
            </nav>

            {/* Language switcher — always visible */}
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-semibold text-gray-300 hover:text-white transition-colors tracking-wide"
            >
              {i18n.language === "ru" ? "EN" : "RU"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
