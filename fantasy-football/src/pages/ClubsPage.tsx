import { useClubs } from "@/hooks/useFantasy";
import Spinner from "@/components/Spinner";
import { Shield, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { resolveMediaUrl } from "@/api/admin";

export default function ClubsPage() {
  const { t } = useTranslation();
  const { data: clubs, isLoading, error } = useClubs();

  if (isLoading) return <Spinner />;
  if (error || !clubs)
    return <p className="text-center text-gray-500 py-20">{t("clubs.failedLoad")}</p>;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t("clubs.title")}</h1>
        <span className="text-gray-500 text-sm">{clubs.length} {t("clubs.clubs")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {club.logo ? (
                  <img src={resolveMediaUrl(club.logo)!} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  <Shield size={24} className="text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{club.name}</p>
                <p className="text-gray-500 text-sm font-mono">{club.short_name}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-sm text-gray-400">
              <Users size={14} />
              <span>{club.players_count} {t("clubs.players")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
