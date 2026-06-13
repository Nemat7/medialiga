import { useState } from "react";
import { useLeaderboard } from "@/hooks/useFantasy";
import Spinner from "@/components/Spinner";
import { ChevronLeft, ChevronRight, Crown, User } from "lucide-react";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useLeaderboard(page);

  if (isLoading) return <Spinner />;
  if (error || !data)
    return <p className="text-center text-gray-500 py-20">{t("leaderboard.failedLoad")}</p>;

  const startRank = (data.current_page - 1) * data.per_page + 1;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">{t("leaderboard.title")}</h1>
        <span className="text-gray-500 text-sm">{data.total} {t("leaderboard.managers")}</span>
      </div>

      <div className="space-y-2">
        {data.data.map((entry, idx) => {
          const rank = startRank + idx;
          const isTop3 = rank <= 3;

          return (
            <div
              key={entry.team_id}
              className={clsx(
                "flex items-center gap-3 sm:gap-4 rounded-xl px-3 sm:px-4 py-3.5 border transition-colors",
                rank === 1
                  ? "bg-yellow-500/5 border-yellow-500/20"
                  : rank === 2
                  ? "bg-gray-400/5 border-gray-500/20"
                  : rank === 3
                  ? "bg-orange-500/5 border-orange-500/20"
                  : "bg-gray-900 border-gray-800 hover:border-gray-700"
              )}
            >
              <div className="w-8 text-center flex-shrink-0">
                {rank === 1 ? (
                  <Crown size={18} className="text-yellow-400 mx-auto" />
                ) : (
                  <span className={clsx("font-bold text-sm", isTop3 ? "text-white" : "text-gray-500")}>
                    {rank}
                  </span>
                )}
              </div>

              <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-gray-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate text-sm">{entry.team_name}</p>
                <p className="text-gray-500 text-xs truncate">{entry.manager_name}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className={clsx("font-bold text-lg", rank === 1 ? "text-yellow-400" : "text-white")}>
                  {entry.total_points}
                </p>
                <p className="text-gray-600 text-xs">{t("leaderboard.pts")}</p>
              </div>
            </div>
          );
        })}
      </div>

      {data.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500">
            {t("leaderboard.page", { current: data.current_page, total: data.last_page })}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === data.last_page}
            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
