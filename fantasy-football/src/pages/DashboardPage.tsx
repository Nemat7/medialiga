import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDashboard, useSeason } from "@/hooks/useFantasy";
import Spinner from "@/components/Spinner";
import {
  Trophy,
  Star,
  ArrowLeftRight,
  Clock,
  KeyRound,
  LogOut,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";

// ─── Token setup screen ────────────────────────────────────────────────────────
function TokenSetup() {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    setToken(trimmed);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
            <KeyRound size={28} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{t("dashboard.title")}</h2>
          <p className="text-gray-500 text-sm">{t("dashboard.noToken")}</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {t("dashboard.tokenLabel")}
          </label>
          <textarea
            rows={4}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder={t("dashboard.tokenPlaceholder")}
            className={clsx(
              "w-full bg-gray-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors resize-none font-mono",
              error ? "border-red-500" : "border-gray-700 focus:border-green-600"
            )}
          />
          {error && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} /> Token cannot be empty
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {t("dashboard.tokenSave")}
        </button>
      </div>
    </div>
  );
}

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
  const { clearToken } = useAuth();
  const { data, isLoading, error } = useDashboard();
  const { data: season } = useSeason();

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle size={40} className="text-red-400 mx-auto" />
        <p className="text-gray-400">Failed to load dashboard. Your token may be invalid.</p>
        <button
          onClick={clearToken}
          className="text-sm text-red-400 hover:text-red-300 underline"
        >
          {t("dashboard.logout")}
        </button>
      </div>
    );
  }

  const currentRound = season?.rounds.find((r) => r.status === "live")
    ?? season?.rounds.find((r) => r.status === "upcoming")
    ?? season?.rounds[season.rounds.length - 1];

  // Dashboard data shape is flexible since we don't have the real response yet
  const team = data?.team ?? null;
  const totalPoints = data?.total_points ?? data?.team?.total_points ?? "—";
  const globalRank = data?.rank ?? data?.team?.rank ?? "—";
  const roundPoints = data?.round_points ?? "—";
  const transfersLeft = data?.transfers_remaining ?? data?.free_transfers ?? "—";
  const userName = data?.user?.name ?? data?.name ?? "";
  const captain = data?.captain ?? data?.team?.captain ?? null;
  const viceCaptain = data?.vice_captain ?? data?.team?.vice_captain ?? null;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-gray-500 text-sm">{t("dashboard.welcome")}</p>
          <h1 className="text-2xl font-bold text-white">
            {userName || t("dashboard.title")}
          </h1>
          {team && (
            <p className="text-green-400 text-sm font-medium mt-0.5">
              {team.name ?? data?.team_name}
            </p>
          )}
        </div>
        <button
          onClick={clearToken}
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
          value={roundPoints}
          sub={currentRound?.name}
          icon={Star}
        />
        <StatCard
          label={t("dashboard.transfersLeft")}
          value={transfersLeft}
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
                <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                  <Clock size={13} />
                  {t("dashboard.deadline")}: {fmt(currentRound.deadline_at)}
                </p>
              </div>
              <RoundBadge status={currentRound.status} />
            </div>
          </div>
        </div>
      )}

      {/* My team */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">{t("dashboard.myTeam")}</h2>

        {!team ? (
          <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-10 text-center space-y-3">
            <Users size={36} className="text-gray-700 mx-auto" />
            <p className="text-white font-semibold">{t("dashboard.noTeam")}</p>
            <p className="text-gray-600 text-sm">{t("dashboard.noTeamSub")}</p>
            <button className="mt-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              {t("dashboard.createTeam")}
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            {/* Captain / Vice-captain */}
            {(captain || viceCaptain) && (
              <div className="grid grid-cols-2 gap-3">
                {captain && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-center">
                    <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wide mb-1">
                      {t("dashboard.captain")}
                    </p>
                    <p className="text-white font-semibold text-sm">
                      {captain.display_name ?? captain.name ?? "—"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {captain.club?.short_name ?? ""}
                    </p>
                  </div>
                )}
                {viceCaptain && (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">
                      {t("dashboard.viceCaptain")}
                    </p>
                    <p className="text-white font-semibold text-sm">
                      {viceCaptain.display_name ?? viceCaptain.name ?? "—"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {viceCaptain.club?.short_name ?? ""}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Raw data fallback while we learn the API shape */}
            {!captain && !viceCaptain && (
              <pre className="text-xs text-gray-500 bg-gray-800 rounded-lg p-3 overflow-auto max-h-60">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page entry ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <DashboardContent /> : <TokenSetup />;
}
