import { useSeason } from "@/hooks/useFantasy";
import Spinner from "@/components/Spinner";
import { Calendar, Clock, Trophy, Users, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

function RoundBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  if (status === "live")
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        {t("rounds.live")}
      </span>
    );
  if (status === "finished")
    return (
      <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
        {t("rounds.finished")}
      </span>
    );
  return (
    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
      {t("rounds.upcoming")}
    </span>
  );
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HomePage() {
  const { t } = useTranslation();
  const { data: season, isLoading, error } = useSeason();

  if (isLoading) return <Spinner />;
  if (error || !season)
    return <p className="text-center text-gray-500 py-20">{t("home.failedSeason")}</p>;

  const { ruleset } = season;
  const scoring = ruleset.scoring_rules;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-green-900/40 to-gray-900 border border-green-800/30 p-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">
              {t("home.activeSeason")}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{season.name}</h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <Calendar size={14} />
              {fmt(season.date_from)} – {fmt(season.date_to)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs uppercase tracking-wide">{t("home.budget")}</p>
            <p className="text-2xl font-bold text-white">{ruleset.budget}</p>
            <p className="text-gray-500 text-xs">{t("home.coins")}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t("home.squadSize"), value: ruleset.squad_size, icon: Users },
            { label: t("home.starting"), value: ruleset.starting_size, icon: Zap },
            { label: t("home.bench"), value: ruleset.bench_size, icon: Users },
            { label: t("home.maxPerClub"), value: ruleset.max_players_per_club, icon: Trophy },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-black/20 rounded-xl p-3 text-center">
              <Icon size={16} className="text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">{t("home.rounds")}</h2>
        <div className="space-y-3">
          {season.rounds.map((round) => (
            <div
              key={round.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-white font-bold text-sm">
                  {round.number}
                </div>
                <div>
                  <p className="font-semibold text-white">{round.name}</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                    <Clock size={11} />
                    {t("home.deadline")}: {fmt(round.deadline_at)}
                  </p>
                </div>
              </div>
              <RoundBadge status={round.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Scoring rules */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">{t("home.scoringRules")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <p className="text-green-400 text-xs font-semibold uppercase tracking-wide">
              {t("home.goals")}
            </p>
            {(["GK", "DEF", "MID", "FWD"] as const).map((pos) => (
              <div key={pos} className="flex justify-between text-sm">
                <span className="text-gray-400">{pos}</span>
                <span className="text-white font-semibold">+{scoring.goal[pos]} {t("home.pts")}</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <p className="text-green-400 text-xs font-semibold uppercase tracking-wide">
              {t("home.bonuses")}
            </p>
            {[
              { key: "home.assist", value: `+${scoring.assist}` },
              { key: "home.cleanSheetGKDEF", value: `+${scoring.clean_sheet.GK}` },
              { key: "home.cleanSheetMID", value: `+${scoring.clean_sheet.MID}` },
              { key: "home.mins60", value: `+${scoring.played_60_minutes}` },
              { key: "home.playerOfMatch", value: `+${scoring.player_of_match}` },
              { key: "home.yellowCard", value: `${scoring.yellow_card}` },
              { key: "home.redCard", value: `${scoring.red_card}` },
              { key: "home.ownGoal", value: `${scoring.own_goal}` },
            ].map(({ key, value }) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-400">{t(key)}</span>
                <span className={value.startsWith("-") ? "text-red-400 font-semibold" : "text-white font-semibold"}>
                  {value} {t("home.pts")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
