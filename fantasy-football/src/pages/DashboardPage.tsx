import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDashboard, useSeason, useMyTeam } from "@/hooks/useFantasy";
import Spinner from "@/components/Spinner";
import {
  Trophy,
  Star,
  ArrowLeftRight,
  Clock,
  LogOut,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border p-4",
        accent
          ? "bg-green-500/10 border-green-500/20"
          : "bg-gray-900 border-gray-800"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-xs font-medium">{label}</span>
        <Icon size={15} className={accent ? "text-green-400" : "text-gray-600"} />
      </div>
      <p className={clsx("text-xl sm:text-2xl font-bold truncate", accent ? "text-green-400" : "text-white")}>
        {value}
      </p>
      {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Round status badge ────────────────────────────────────────────────────────
function RoundBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  if (status === "live")
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        {t("rounds.live")}
      </span>
    );
  if (status === "finished")
    return (
      <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">
        {t("rounds.finished")}
      </span>
    );
  return (
    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
      {t("rounds.upcoming")}
    </span>
  );
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Main dashboard ────────────────────────────────────────────────────────────
function DashboardContent() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboard();
  const { data: season } = useSeason();
  const { data: myTeam } = useMyTeam();
  const hasPlayers = Array.isArray(myTeam?.players) && myTeam.players.length > 0;

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle size={40} className="text-red-400 mx-auto" />
        <p className="text-gray-400">Failed to load dashboard. Your token may be invalid.</p>
        <button
          onClick={logout}
          className="text-sm text-red-400 hover:text-red-300 underline"
        >
          {t("dashboard.logout")}
        </button>
      </div>
    );
  }

  // Real API shape: { has_team, team: { id, name, total_points, rank }, participants_count, next_round, ... }
  const hasTeam = data?.has_team ?? !!data?.team;
  const team = data?.team ?? null;
  const totalPoints = team?.total_points ?? "—";
  const globalRank = team?.rank ?? "—";
  const nextRound = data?.next_round ?? null;
  const currentRound =
    nextRound ??
    season?.rounds.find((r) => r.status === "live") ??
    season?.rounds.find((r) => r.status === "upcoming") ??
    season?.rounds[season.rounds.length - 1];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-gray-500 text-sm">{t("dashboard.welcome")}</p>
          <h1 className="text-2xl font-bold text-white">{t("dashboard.title")}</h1>
          {team && (
            <p className="text-green-400 text-sm font-medium mt-0.5">{team.name}</p>
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-900"
        >
          <LogOut size={14} />
          {t("dashboard.logout")}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={t("dashboard.totalPoints")}
          value={totalPoints}
          sub={t("dashboard.pts")}
          icon={Trophy}
          accent
        />
        <StatCard
          label={t("dashboard.globalRank")}
          value={globalRank === "—" ? "—" : `#${globalRank}`}
          icon={TrendingUp}
        />
        <StatCard
          label={t("dashboard.roundPoints")}
          value="—"
          sub={currentRound?.name}
          icon={Star}
        />
        <StatCard
          label={t("dashboard.transfersLeft")}
          value="—"
          sub={t("dashboard.free")}
          icon={ArrowLeftRight}
        />
      </div>

      {/* Current round */}
      {currentRound && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">{t("dashboard.currentRound")}</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-white text-lg">{currentRound.name}</p>
                {currentRound.deadline_at && (
                  <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                    <Clock size={13} />
                    {t("dashboard.deadline")}: {fmt(currentRound.deadline_at)}
                  </p>
                )}
              </div>
              {currentRound.status && <RoundBadge status={currentRound.status} />}
            </div>
          </div>
        </div>
      )}

      {/* My team */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">{t("dashboard.myTeam")}</h2>

        {!hasTeam ? (
          <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-10 text-center space-y-3">
            <Users size={36} className="text-gray-700 mx-auto" />
            <p className="text-white font-semibold">{t("dashboard.noTeam")}</p>
            <p className="text-gray-600 text-sm">{t("dashboard.noTeamSub")}</p>
            <button
              onClick={() => navigate("/team/create")}
              className="mt-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              {t("dashboard.createTeam")}
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate(hasPlayers ? "/transfers" : "/team/create")}
            className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-colors text-left"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-white font-bold text-lg">{team?.name}</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {!hasPlayers
                    ? t("transfers.emptySquadSubtitle")
                    : data?.participants_count
                    ? `${data.participants_count} managers in league`
                    : t("dashboard.myTeam")}
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{totalPoints}</p>
                  <p className="text-gray-500 text-xs">{t("dashboard.pts")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {globalRank === "—" ? "—" : `#${globalRank}`}
                  </p>
                  <p className="text-gray-500 text-xs">{t("dashboard.globalRank")}</p>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
