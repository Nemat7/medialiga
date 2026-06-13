import { useTranslation } from "react-i18next";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  const { i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold text-sm">
            FP
          </div>
          <span className="font-bold text-white text-base tracking-tight">
            Football Plus Fantasy
          </span>
        </div>
        <button
          onClick={toggleLang}
          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
        >
          {i18n.language === "ru" ? "EN" : "RU"}
        </button>
      </header>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
