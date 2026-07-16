import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { X, User, TrendingUp, Star, Users } from "lucide-react";
import { clsx } from "clsx";
import { fantasyApi } from "@/api/fantasy";
import { resolveMediaUrl } from "@/api/admin";
import PositionBadge from "@/components/PositionBadge";
import Spinner from "@/components/Spinner";
import type { PlayerCardMatch } from "@/types";

// Maps breakdown keys from the API to i18n label keys
const BREAKDOWN_LABELS: Record<string, string> = {
  goals: "playerCard.goals",
  assists: "playerCard.assists",
  saves: "playerCard.saves",
  own_goals: "playerCard.ownGoals",
  red_cards: "playerCard.redCards",
  clean_sheet: "playerCard.cleanSheets",
  yellow_cards: "playerCard.yellowCards",
  goals_conceded: "playerCard.goalsConceded",
  penalties_saved: "playerCard.penaltiesSaved",
  player_of_match: "playerCard.playerOfMatch",
  missed_penalties: "playerCard.penaltiesMissed",
  played_60_minutes: "playerCard.played60",
};

function FantasyTile({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-3 text-center">
      <Icon size={13} className="text-green-400 mx-auto mb-1" />
      <p className="text-white font-bold text-lg leading-tight">{value}</p>
      <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
    </div>
  );
}

function MatchRow({ match }: { match: PlayerCardMatch }) {
  const { t } = useTranslation();
  const nonZero = Object.entries(match.breakdown).filter(([, v]) => v !== 0);
  return (
    <div className="bg-gray-800/40 rounded-xl p-3.5 border border-gray-700/50">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {match.home_club} — {match.away_club}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">{match.round_name}</p>
        </div>
        <span
          className={clsx(
            "flex-shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold",
            match.points > 0
              ? "bg-green-500/15 text-green-400"
              : match.points < 0
              ? "bg-red-500/15 text-red-400"
              : "bg-gray-800 text-gray-500"
          )}
        >
          {match.points > 0 ? `+${match.points}` : match.points}
        </span>
      </div>
      {nonZero.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {nonZero.map(([key, val]) => (
            <span key={key} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              {t(BREAKDOWN_LABELS[key] ?? key)}: {val > 0 ? `+${val}` : val}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlayerCardModal({ playerId, onClose }: { playerId: number; onClose: () => void }) {
  const { t } = useTranslation();
  const { data: card, isLoading, isError } = useQuery({
    queryKey: ["player-card", playerId],
    queryFn: () => fantasyApi.getPlayerCard(playerId),
  });

  const photoUrl = card ? card.photo_url ?? resolveMediaUrl(card.photo) : null;
  const clubLogo = card ? card.club.logo_url ?? resolveMediaUrl(card.club.logo) : null;

  const statRows: { label: string; value: number }[] = card
    ? [
        { label: t("playerCard.matches"), value: card.statistics.matches },
        { label: t("playerCard.minutes"), value: card.statistics.minutes },
        { label: t("playerCard.goals"), value: card.statistics.goals },
        { label: t("playerCard.assists"), value: card.statistics.assists },
        { label: t("playerCard.yellowCards"), value: card.statistics.yellow_cards },
        { label: t("playerCard.redCards"), value: card.statistics.red_cards },
        { label: t("playerCard.cleanSheets"), value: card.statistics.clean_sheets },
        { label: t("playerCard.goalsConceded"), value: card.statistics.goals_conceded },
        { label: t("playerCard.saves"), value: card.statistics.saves },
        { label: t("playerCard.penaltiesSaved"), value: card.statistics.penalties_saved },
        { label: t("playerCard.penaltiesMissed"), value: card.statistics.penalties_missed },
        { label: t("playerCard.ownGoals"), value: card.statistics.own_goals },
        { label: t("playerCard.playerOfMatch"), value: card.statistics.player_of_match_count },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white p-1.5 rounded-lg bg-gray-900/80 hover:bg-gray-800"
        >
          <X size={18} />
        </button>

        {isLoading ? (
          <div className="py-24 flex justify-center"><Spinner /></div>
        ) : isError || !card ? (
          <p className="text-center text-gray-500 py-24">{t("playerCard.failedLoad")}</p>
        ) : (
          <>
            {/* Header */}
            <div className="p-5 pb-4 bg-gradient-to-b from-green-900/20 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-700">
                  {photoUrl ? (
                    <img src={photoUrl} alt={card.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={26} className="text-gray-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-white font-bold text-lg leading-tight truncate">{card.display_name}</h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <PositionBadge position={card.position} />
                    <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                      {clubLogo && <img src={clubLogo} alt="" className="w-4 h-4 object-contain" />}
                      {card.club.name}
                    </span>
                    {card.status !== "active" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">
                        {card.status === "injured" ? t("playerCard.injured") : t("playerCard.suspended")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-green-400 font-bold text-lg">{card.price}</p>
                  <p className="text-gray-600 text-[10px]">{t("players.coins")}</p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 space-y-5">
              {/* Fantasy tiles */}
              <div className="grid grid-cols-4 gap-2">
                <FantasyTile label={t("playerCard.points")} value={card.fantasy.total_points} icon={Star} />
                <FantasyTile label={t("playerCard.avg")} value={card.fantasy.average_points} icon={TrendingUp} />
                <FantasyTile label={t("playerCard.best")} value={card.fantasy.best_match_points} icon={Star} />
                <FantasyTile label={t("playerCard.owned")} value={`${card.fantasy.ownership_percent}%`} icon={Users} />
              </div>

              {/* Season statistics */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-2.5">{t("playerCard.seasonStats")}</h3>
                <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 divide-y divide-gray-800">
                  {statRows.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2">
                      <span className="text-gray-400 text-xs">{label}</span>
                      <span className="text-white text-sm font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent matches */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-2.5">{t("playerCard.last5")}</h3>
                {card.last_5_matches.length === 0 ? (
                  <p className="text-gray-600 text-xs text-center py-6 border border-dashed border-gray-800 rounded-xl">
                    {t("playerCard.noMatches")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {card.last_5_matches.map((m) => (
                      <MatchRow key={m.fixture_id} match={m} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
