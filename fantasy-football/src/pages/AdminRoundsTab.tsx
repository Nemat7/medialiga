import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, X, Check, Trash2, Play, Flag, Trophy, Zap, Lock, Clock,
  ChevronLeft, CalendarPlus, Link2, AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";
import {
  adminApi,
  type AdminClub,
  type AdminFixture,
  type AdminPlayer,
  type PlayerMatchStat,
} from "@/api/admin";
import { extractApiError } from "@/api/auth";
import type { Season, Round } from "@/types";

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

// ─── Local fixture store ──────────────────────────────────────────────────────
// The API has no GET endpoint for fixtures yet, so fixtures created here are
// remembered in localStorage per round. Ask backend for GET /rounds/{id}/fixtures.
const LS_KEY = "fantasy_admin_fixtures_v1";

function loadAllFixtures(): Record<string, AdminFixture[]> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function loadFixtures(roundId: number): AdminFixture[] {
  return loadAllFixtures()[String(roundId)] ?? [];
}

function persistFixtures(roundId: number, fixtures: AdminFixture[]) {
  const all = loadAllFixtures();
  all[String(roundId)] = fixtures;
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toApiDate(dtLocal: string): string {
  // "2026-07-18T18:00" -> "2026-07-18 18:00:00"
  if (!dtLocal) return "";
  const [d, t] = dtLocal.split("T");
  return `${d} ${t.length === 5 ? `${t}:00` : t}`;
}

function fmtDate(s: string | undefined) {
  if (!s) return "";
  return new Date(s.replace(" ", "T")).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ROUND_BADGE: Record<Round["status"], string> = {
  upcoming: "bg-blue-500/15 text-blue-400",
  live: "bg-green-500/15 text-green-400",
  finished: "bg-yellow-500/15 text-yellow-400",
  finalized: "bg-gray-700 text-gray-400",
};

const FIXTURE_BADGE: Record<AdminFixture["status"], string> = {
  scheduled: "bg-blue-500/15 text-blue-400",
  live: "bg-green-500/15 text-green-400",
  finished: "bg-yellow-500/15 text-yellow-400",
  postponed: "bg-gray-700 text-gray-400",
};

const defaultStat = (): PlayerMatchStat => ({
  player_id: 0,
  minutes: 90,
  goals: 0,
  assists: 0,
  yellow_cards: 0,
  red_cards: 0,
  goals_conceded: 0,
  saves: 0,
  penalties_saved: 0,
  penalties_missed: 0,
  own_goals: 0,
  clean_sheet: false,
  player_of_match: false,
});

// ─── Stat row (player select limited to this fixture's clubs) ─────────────────
function StatRow({
  stat,
  players,
  index,
  onUpdate,
  onRemove,
}: {
  stat: PlayerMatchStat;
  players: AdminPlayer[];
  index: number;
  onUpdate: (i: number, field: keyof PlayerMatchStat, value: number | boolean) => void;
  onRemove: (i: number) => void;
}) {
  const num = (field: keyof PlayerMatchStat) => (
    <input
      type="number"
      min={0}
      value={stat[field] as number}
      onChange={(e) => onUpdate(index, field, Number(e.target.value))}
      className="w-full bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-white text-xs text-center focus:outline-none focus:border-green-500"
    />
  );

  const cells: { label: string; field: keyof PlayerMatchStat }[] = [
    { label: "Min", field: "minutes" },
    { label: "Goals", field: "goals" },
    { label: "Ast", field: "assists" },
    { label: "YC", field: "yellow_cards" },
    { label: "RC", field: "red_cards" },
    { label: "GC", field: "goals_conceded" },
    { label: "Saves", field: "saves" },
    { label: "PS", field: "penalties_saved" },
    { label: "PM", field: "penalties_missed" },
    { label: "OG", field: "own_goals" },
  ];

  return (
    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-3">
        <select
          value={stat.player_id}
          onChange={(e) => onUpdate(index, "player_id", Number(e.target.value))}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-green-500"
        >
          <option value={0}>Select player...</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.position}] {p.display_name} – {p.club?.short_name ?? `#${p.club_id}`}
            </option>
          ))}
        </select>
        <button onClick={() => onRemove(index)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg">
          <Trash2 size={15} />
        </button>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 items-end">
        {cells.map(({ label, field }) => (
          <div key={field} className="text-center">
            <p className="text-[10px] text-gray-500 mb-1">{label}</p>
            {num(field)}
          </div>
        ))}
        <div className="text-center">
          <p className="text-[10px] text-gray-500 mb-1">CS</p>
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={stat.clean_sheet}
              onChange={(e) => onUpdate(index, "clean_sheet", e.target.checked)}
              className="w-4 h-4 accent-green-400 cursor-pointer"
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 mb-1">PoM</p>
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={stat.player_of_match}
              onChange={(e) => onUpdate(index, "player_of_match", e.target.checked)}
              className="w-4 h-4 accent-yellow-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stats modal ──────────────────────────────────────────────────────────────
function StatsModal({
  fixture,
  clubName,
  onClose,
  onSaved,
}: {
  fixture: AdminFixture;
  clubName: (id: number) => string;
  onClose: () => void;
  onSaved: (homeScore: number, awayScore: number) => void;
}) {
  const [homeScore, setHomeScore] = useState(fixture.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(fixture.away_score ?? 0);
  const [rows, setRows] = useState<PlayerMatchStat[]>([defaultStat()]);
  const [error, setError] = useState("");

  const { data: homePlayers = [] } = useQuery({
    queryKey: ["club-players", fixture.home_club_id],
    queryFn: () => adminApi.getClubPlayers(fixture.home_club_id),
  });
  const { data: awayPlayers = [] } = useQuery({
    queryKey: ["club-players", fixture.away_club_id],
    queryFn: () => adminApi.getClubPlayers(fixture.away_club_id),
  });
  const players = [...homePlayers, ...awayPlayers];

  const saveMutation = useMutation({
    mutationFn: () =>
      adminApi.storeFixtureStats(fixture.id, {
        home_score: homeScore,
        away_score: awayScore,
        players: rows,
      }),
    onSuccess: () => onSaved(homeScore, awayScore),
    onError: (e) => setError(extractApiError(e, "Failed to save stats")),
  });

  const updateRow = (i: number, field: keyof PlayerMatchStat, value: number | boolean) =>
    setRows((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  const removeRow = (i: number) => setRows((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-white font-semibold text-lg">
            Score & Stats — {clubName(fixture.home_club_id)} vs {clubName(fixture.away_club_id)}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Score */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                {clubName(fixture.home_club_id)} (home)
              </label>
              <input type="number" min={0} className={inputCls} value={homeScore} onChange={(e) => setHomeScore(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                {clubName(fixture.away_club_id)} (away)
              </label>
              <input type="number" min={0} className={inputCls} value={awayScore} onChange={(e) => setAwayScore(Number(e.target.value))} />
            </div>
          </div>

          {/* Player rows */}
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Player Stats</h3>
            <button
              onClick={() => setRows((p) => [...p, defaultStat()])}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-green-400 rounded-lg text-sm"
            >
              <Plus size={14} />
              Add Player
            </button>
          </div>

          <div className="space-y-3">
            {rows.map((stat, i) => (
              <StatRow key={i} stat={stat} players={players} index={i} onUpdate={updateRow} onRemove={removeRow} />
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium">
              Cancel
            </button>
            <button
              onClick={() => {
                setError("");
                if (rows.some((r) => !r.player_id)) {
                  setError("Select a player for each row");
                  return;
                }
                saveMutation.mutate();
              }}
              disabled={saveMutation.isPending}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
            >
              {saveMutation.isPending ? "Saving..." : "Save Score & Stats"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create round modal ───────────────────────────────────────────────────────
function CreateRoundModal({
  season,
  onClose,
  onCreated,
}: {
  season: Season;
  onClose: () => void;
  onCreated: () => void;
}) {
  const nextNumber = Math.max(0, ...season.rounds.map((r) => r.number)) + 1;
  const [number, setNumber] = useState(nextNumber);
  const [name, setName] = useState(`Тур ${nextNumber}`);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.createRound({
        season_id: season.id,
        number,
        name,
        starts_at: toApiDate(startsAt),
        ends_at: toApiDate(endsAt),
        deadline_at: toApiDate(deadlineAt),
      }),
    onSuccess: onCreated,
    onError: (e) => setError(extractApiError(e, "Failed to create round")),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">New Round</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Number</label>
              <input type="number" min={1} className={inputCls} value={number} onChange={(e) => setNumber(Number(e.target.value))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Starts at</label>
            <input type="datetime-local" className={inputCls} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Ends at</label>
            <input type="datetime-local" className={inputCls} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Deadline (lineups lock)</label>
            <input type="datetime-local" className={inputCls} value={deadlineAt} onChange={(e) => setDeadlineAt(e.target.value)} />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium">
              Cancel
            </button>
            <button
              onClick={() => {
                setError("");
                if (!startsAt || !endsAt || !deadlineAt) {
                  setError("Fill in all dates");
                  return;
                }
                mutation.mutate();
              }}
              disabled={mutation.isPending || !name}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
            >
              {mutation.isPending ? "Creating..." : "Create Round"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fixture card ─────────────────────────────────────────────────────────────
function FixtureCard({
  fixture,
  roundStatus,
  clubName,
  onStart,
  onOpenStats,
  onFinish,
  onCalcPoints,
  onRemoveLocal,
  busy,
  showRemove = true,
}: {
  fixture: AdminFixture;
  roundStatus: Round["status"];
  clubName: (id: number) => string;
  onStart: () => void;
  onOpenStats: () => void;
  onFinish: () => void;
  onCalcPoints: () => void;
  onRemoveLocal: () => void;
  busy: boolean;
  showRemove?: boolean;
}) {
  const hasScore = fixture.home_score != null && fixture.away_score != null;
  const homeName = fixture.home_club_name ?? clubName(fixture.home_club_id);
  const awayName = fixture.away_club_name ?? clubName(fixture.away_club_id);
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <p className="text-white font-medium text-sm">
            {homeName}
            <span className="mx-2 text-gray-500 font-bold">
              {hasScore ? `${fixture.home_score} : ${fixture.away_score}` : "vs"}
            </span>
            {awayName}
          </p>
          <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1.5">
            <Clock size={11} />
            {fmtDate(fixture.kickoff_at)} · #{fixture.id}
            {fixture.has_stats && <span className="text-green-500">· stats ✓</span>}
            {fixture.points_calculated && <span className="text-green-500">· points ✓</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", FIXTURE_BADGE[fixture.status])}>
            {fixture.status}
          </span>

          {roundStatus === "live" && fixture.status === "scheduled" && (
            <button
              onClick={onStart}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
            >
              <Play size={12} />
              Start Match
            </button>
          )}

          {fixture.status === "live" && (
            <>
              <button
                onClick={onOpenStats}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/25 text-blue-400 rounded-lg text-xs font-semibold"
              >
                Score & Stats
              </button>
              <button
                onClick={onFinish}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-semibold"
              >
                <Flag size={12} />
                Finish
              </button>
            </>
          )}

          {fixture.status === "finished" && (
            <button
              onClick={onCalcPoints}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/25 text-blue-400 rounded-lg text-xs font-semibold"
            >
              <Zap size={12} />
              Calc Player Points
            </button>
          )}

          {showRemove && (
            <button
              onClick={onRemoveLocal}
              title="Remove from this list (does not delete on server)"
              className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Rounds tab ──────────────────────────────────────────────────────────
export default function RoundsTab({ season, clubs }: { season: Season; clubs: AdminClub[] }) {
  const qc = useQueryClient();
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [showCreateRound, setShowCreateRound] = useState(false);
  const [fixtures, setFixtures] = useState<AdminFixture[]>([]);
  const [statsFixture, setStatsFixture] = useState<AdminFixture | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Add fixture form
  const [homeClubId, setHomeClubId] = useState<number>(0);
  const [awayClubId, setAwayClubId] = useState<number>(0);
  const [kickoffAt, setKickoffAt] = useState("");

  // Attach existing fixture form
  const [showAttach, setShowAttach] = useState(false);
  const [attachId, setAttachId] = useState("");
  const [attachHome, setAttachHome] = useState<number>(0);
  const [attachAway, setAttachAway] = useState<number>(0);
  const [attachStatus, setAttachStatus] = useState<AdminFixture["status"]>("scheduled");

  const rounds = [...season.rounds].sort((a, b) => b.number - a.number);
  const selectedRound = rounds.find((r) => r.id === selectedRoundId) ?? null;
  const lastRound = rounds[0];
  const canCreateRound = !lastRound || lastRound.status === "finalized";

  // Server is the source of truth for the active round's fixtures;
  // localStorage remains the fallback for other rounds.
  const { data: activeData } = useQuery({
    queryKey: ["active-round-fixtures", season.id],
    queryFn: () => adminApi.getActiveRoundFixtures(season.id),
    retry: false,
  });
  const serverBacked = !!activeData && selectedRoundId === activeData.round.id;
  const displayFixtures = serverBacked ? activeData.fixtures : fixtures;
  const refreshFixtures = () => qc.invalidateQueries({ queryKey: ["active-round-fixtures"] });

  const clubName = useCallback(
    (id: number) => clubs.find((c) => c.id === id)?.short_name ?? clubs.find((c) => c.id === id)?.name ?? `Club #${id}`,
    [clubs]
  );

  useEffect(() => {
    if (selectedRoundId != null) setFixtures(loadFixtures(selectedRoundId));
  }, [selectedRoundId]);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const setAndPersistFixtures = useCallback(
    (updater: (prev: AdminFixture[]) => AdminFixture[]) => {
      setFixtures((prev) => {
        const next = updater(prev);
        if (selectedRoundId != null) persistFixtures(selectedRoundId, next);
        return next;
      });
    },
    [selectedRoundId]
  );

  const patchFixture = useCallback(
    (id: number, patch: Partial<AdminFixture>) =>
      setAndPersistFixtures((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f))),
    [setAndPersistFixtures]
  );

  const refreshSeason = () => qc.invalidateQueries({ queryKey: ["season"] });

  // ── Mutations ──
  const createFixtureMutation = useMutation({
    mutationFn: () =>
      adminApi.createFixture(selectedRoundId!, {
        home_club_id: homeClubId,
        away_club_id: awayClubId,
        kickoff_at: toApiDate(kickoffAt),
      }),
    onSuccess: (created) => {
      setAndPersistFixtures((prev) => [
        ...prev,
        {
          id: created?.id,
          round_id: selectedRoundId!,
          home_club_id: homeClubId,
          away_club_id: awayClubId,
          kickoff_at: toApiDate(kickoffAt),
          status: created?.status ?? "scheduled",
          home_score: null,
          away_score: null,
        },
      ]);
      setHomeClubId(0);
      setAwayClubId(0);
      setKickoffAt("");
      refreshFixtures();
      showToast("Match added!", true);
    },
    onError: (e) => showToast(extractApiError(e, "Failed to add match"), false),
  });

  const roundAction = useMutation({
    mutationFn: ({ action }: { action: "start" | "finish" | "calc" | "finalize" }) => {
      const id = selectedRoundId!;
      if (action === "start") return adminApi.startRound(id);
      if (action === "finish") return adminApi.finishRound(id);
      if (action === "calc") return adminApi.calculateRoundTeamPoints(id);
      return adminApi.finalizeRound(id);
    },
    onSuccess: (_data, { action }) => {
      refreshSeason();
      refreshFixtures();
      const msgs = {
        start: "Round started! Lineups snapshotted.",
        finish: "Round finished!",
        calc: "Team points calculated!",
        finalize: "Round finalized!",
      };
      showToast(msgs[action], true);
    },
    onError: (e) => showToast(extractApiError(e, "Action failed"), false),
  });

  const fixtureAction = useMutation({
    mutationFn: ({ fixtureId, action }: { fixtureId: number; action: "start" | "finish" | "calc" }) => {
      if (action === "start") return adminApi.startFixture(fixtureId);
      if (action === "finish") return adminApi.finishFixture(fixtureId);
      return adminApi.calculateFixturePoints(fixtureId);
    },
    onSuccess: (_data, { fixtureId, action }) => {
      if (serverBacked) {
        refreshFixtures();
      } else {
        if (action === "start") patchFixture(fixtureId, { status: "live" });
        if (action === "finish") patchFixture(fixtureId, { status: "finished" });
      }
      const msgs = { start: "Match started!", finish: "Match finished!", calc: "Player points calculated!" };
      showToast(msgs[action], true);
    },
    onError: (e) => showToast(extractApiError(e, "Action failed"), false),
  });

  const busy = roundAction.isPending || fixtureAction.isPending;

  // ── Rounds list view ──
  if (!selectedRound) {
    return (
      <div>
        {toast && (
          <div className={clsx("flex items-center gap-2 p-3 mb-4 rounded-xl text-sm font-medium", toast.ok ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20")}>
            {toast.ok ? <Check size={15} /> : <X size={15} />}
            {toast.msg}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400 text-sm">{rounds.length} rounds</p>
          <button
            onClick={() => setShowCreateRound(true)}
            disabled={!canCreateRound}
            title={canCreateRound ? "" : "Previous round must be finalized first"}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold"
          >
            <Plus size={15} />
            New Round
          </button>
        </div>

        {!canCreateRound && (
          <p className="text-gray-500 text-xs mb-4 flex items-center gap-1.5">
            <Lock size={12} />
            A new round can be created only after "{lastRound.name}" is finalized.
          </p>
        )}

        <div className="space-y-2">
          {rounds.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoundId(r.id)}
              className="w-full flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{r.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {fmtDate(r.starts_at)} → {fmtDate(r.ends_at)} · deadline {fmtDate(r.deadline_at)}
                </p>
              </div>
              <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0", ROUND_BADGE[r.status])}>
                {r.status}
              </span>
            </button>
          ))}
        </div>

        {showCreateRound && (
          <CreateRoundModal
            season={season}
            onClose={() => setShowCreateRound(false)}
            onCreated={() => {
              setShowCreateRound(false);
              refreshSeason();
              showToast("Round created!", true);
            }}
          />
        )}
      </div>
    );
  }

  // ── Round detail view ──
  const rs = selectedRound.status;
  return (
    <div className="space-y-5">
      {toast && (
        <div className={clsx("flex items-center gap-2 p-3 rounded-xl text-sm font-medium", toast.ok ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20")}>
          {toast.ok ? <Check size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedRoundId(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              {selectedRound.name}
              <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", ROUND_BADGE[rs])}>{rs}</span>
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {fmtDate(selectedRound.starts_at)} → {fmtDate(selectedRound.ends_at)} · deadline {fmtDate(selectedRound.deadline_at)}
            </p>
          </div>
        </div>

        {/* Round-level action for current status */}
        <div className="flex gap-2">
          {rs === "upcoming" && (
            <button
              onClick={() => {
                if (fixtures.length === 0 && !window.confirm("No matches in the local list. The API requires all matches to be added before starting. Start anyway?")) return;
                if (!window.confirm(`Start ${selectedRound.name}? Lineups will be locked and snapshotted. This cannot be undone.`)) return;
                roundAction.mutate({ action: "start" });
              }}
              disabled={busy}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
            >
              <Play size={14} />
              Start Round
            </button>
          )}
          {rs === "live" && (
            <button
              onClick={() => {
                if (!window.confirm(`Finish ${selectedRound.name}? All matches should be finished first.`)) return;
                roundAction.mutate({ action: "finish" });
              }}
              disabled={busy}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 rounded-xl text-sm font-semibold"
            >
              <Flag size={14} />
              Finish Round
            </button>
          )}
          {rs === "finished" && (
            <>
              <button
                onClick={() => roundAction.mutate({ action: "calc" })}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/25 text-blue-400 rounded-xl text-sm font-semibold"
              >
                <Trophy size={14} />
                Calc Team Points
              </button>
              <button
                onClick={() => {
                  if (!window.confirm(`Finalize ${selectedRound.name}? The round becomes fully closed and read-only. Make sure team points are calculated.`)) return;
                  roundAction.mutate({ action: "finalize" });
                }}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
              >
                <Lock size={14} />
                Finalize
              </button>
            </>
          )}
        </div>
      </div>

      {/* Flow hint */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-500">
        Flow: create round → add all matches → start round → (start match → save score & stats → finish match → calc player points) for each match → finish round → calc team points → finalize
      </div>

      {/* Add fixture — only while upcoming */}
      {rs === "upcoming" && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CalendarPlus size={16} className="text-green-400" />
            Add Match
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Home club</label>
              <select className={selectCls} value={homeClubId} onChange={(e) => setHomeClubId(Number(e.target.value))}>
                <option value={0}>Select...</option>
                {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Away club</label>
              <select className={selectCls} value={awayClubId} onChange={(e) => setAwayClubId(Number(e.target.value))}>
                <option value={0}>Select...</option>
                {clubs.filter((c) => c.id !== homeClubId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Kickoff</label>
              <input type="datetime-local" className={inputCls} value={kickoffAt} onChange={(e) => setKickoffAt(e.target.value)} />
            </div>
            <button
              onClick={() => {
                if (!homeClubId || !awayClubId || !kickoffAt) return showToast("Fill in both clubs and kickoff time", false);
                createFixtureMutation.mutate();
              }}
              disabled={createFixtureMutation.isPending}
              className="py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
            >
              {createFixtureMutation.isPending ? "Adding..." : "Add Match"}
            </button>
          </div>
        </div>
      )}

      {/* Fixtures list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">
            Matches ({displayFixtures.length})
            {serverBacked && <span className="ml-2 text-xs text-green-500 font-normal">· live from server</span>}
          </h3>
          {!serverBacked && (
            <button
              onClick={() => setShowAttach((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300"
            >
              <Link2 size={12} />
              Attach existing fixture by ID
            </button>
          )}
        </div>

        {showAttach && (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 mb-3 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Fixture ID</label>
              <input type="number" className={inputCls} value={attachId} onChange={(e) => setAttachId(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Home club</label>
              <select className={selectCls} value={attachHome} onChange={(e) => setAttachHome(Number(e.target.value))}>
                <option value={0}>Select...</option>
                {clubs.map((c) => <option key={c.id} value={c.id}>{c.short_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Away club</label>
              <select className={selectCls} value={attachAway} onChange={(e) => setAttachAway(Number(e.target.value))}>
                <option value={0}>Select...</option>
                {clubs.map((c) => <option key={c.id} value={c.id}>{c.short_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
              <select className={selectCls} value={attachStatus} onChange={(e) => setAttachStatus(e.target.value as AdminFixture["status"])}>
                {(["scheduled", "live", "finished", "postponed"] as const).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button
              onClick={() => {
                const id = Number(attachId);
                if (!id || !attachHome || !attachAway) return showToast("Fill in fixture ID and both clubs", false);
                if (fixtures.some((f) => f.id === id)) return showToast("Fixture already in the list", false);
                setAndPersistFixtures((prev) => [...prev, { id, round_id: selectedRound.id, home_club_id: attachHome, away_club_id: attachAway, kickoff_at: "", status: attachStatus, home_score: null, away_score: null }]);
                setAttachId("");
                setShowAttach(false);
                showToast("Fixture attached to the list", true);
              }}
              className="py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-semibold"
            >
              Attach
            </button>
          </div>
        )}

        {displayFixtures.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-sm border border-dashed border-gray-800 rounded-xl">
            No matches in this round yet.
            {!serverBacked && (
              <>
                <br />
                <span className="text-xs">
                  Only the active round's matches can be loaded from the server.
                  If matches were created elsewhere, attach them by ID above.
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayFixtures.map((f) => (
              <FixtureCard
                key={f.id}
                fixture={f}
                roundStatus={rs}
                clubName={clubName}
                busy={busy}
                showRemove={!serverBacked}
                onStart={() => fixtureAction.mutate({ fixtureId: f.id, action: "start" })}
                onOpenStats={() => setStatsFixture(f)}
                onFinish={() => {
                  if (!window.confirm("Finish this match? Score and stats must be saved first.")) return;
                  fixtureAction.mutate({ fixtureId: f.id, action: "finish" });
                }}
                onCalcPoints={() => fixtureAction.mutate({ fixtureId: f.id, action: "calc" })}
                onRemoveLocal={() => {
                  if (!window.confirm("Remove this match from the local list? (It is NOT deleted on the server.)")) return;
                  setAndPersistFixtures((prev) => prev.filter((x) => x.id !== f.id));
                }}
              />
            ))}
          </div>
        )}
      </div>

      {statsFixture && (
        <StatsModal
          fixture={statsFixture}
          clubName={clubName}
          onClose={() => setStatsFixture(null)}
          onSaved={(hs, as) => {
            if (serverBacked) {
              refreshFixtures();
            } else {
              patchFixture(statsFixture.id, { home_score: hs, away_score: as });
            }
            setStatsFixture(null);
            showToast("Score & stats saved!", true);
          }}
        />
      )}
    </div>
  );
}
