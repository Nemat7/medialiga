import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fantasyApi } from "@/api/fantasy";
import { useSeason } from "@/hooks/useFantasy";
import { extractApiError } from "@/api/auth";
import Spinner from "@/components/Spinner";
import type { Player, Position } from "@/types";
import { Search, ArrowLeft, Plus, Minus, AlertCircle, CheckCircle2 } from "lucide-react";
import { resolveMediaUrl } from "@/api/admin";
import { clsx } from "clsx";

const POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"];

type SquadSlot = {
  player: Player;
  isStarting: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
};

function fmtBudget(val: number) {
  return `${val.toFixed(1)}M`;
}

// ─── Player card in picker list ────────────────────────────────────────────────
function PlayerRow({
  player,
  inSquad,
  canAdd,
  onAdd,
  onRemove,
}: {
  player: Player;
  inSquad: boolean;
  canAdd: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center text-xs text-gray-500 font-bold">
          {player.photo ? (
            <img src={resolveMediaUrl(player.photo)!} alt="" className="w-full h-full object-cover" />
          ) : (
            player.position
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{player.display_name}</p>
          <p className="text-gray-500 text-xs">{player.club?.short_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-green-400 text-sm font-semibold">{fmtBudget(player.price)}</span>
        {inSquad ? (
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
          >
            <Minus size={14} />
          </button>
        ) : (
          <button
            onClick={onAdd}
            disabled={!canAdd}
            className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              canAdd
                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            )}
          >
            <Plus size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Squad player row in lineup step ──────────────────────────────────────────
function LineupRow({
  slot,
  isStarting,
  onToggleStarting,
  onSetCaptain,
  onSetViceCaptain,
  canMoveToStarting,
}: {
  slot: SquadSlot;
  isStarting: boolean;
  onToggleStarting: () => void;
  onSetCaptain: () => void;
  onSetViceCaptain: () => void;
  canMoveToStarting: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-xs font-bold text-gray-600 w-8 text-center flex-shrink-0">
        {slot.player.position}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{slot.player.display_name}</p>
        <p className="text-gray-500 text-xs">{slot.player.club?.short_name}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Captain */}
        <button
          onClick={onSetCaptain}
          className={clsx(
            "px-2 py-1 rounded-lg text-xs font-bold transition-colors",
            slot.isCaptain
              ? "bg-yellow-500 text-black"
              : "bg-gray-800 text-gray-500 hover:text-yellow-400"
          )}
        >
          {t("teamBuilder.captain")}
        </button>
        {/* Vice Captain */}
        <button
          onClick={onSetViceCaptain}
          className={clsx(
            "px-2 py-1 rounded-lg text-xs font-bold transition-colors",
            slot.isViceCaptain
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-500 hover:text-blue-400"
          )}
        >
          {t("teamBuilder.viceCaptain")}
        </button>
        {/* Move to bench / starting */}
        <button
          onClick={onToggleStarting}
          disabled={!isStarting && !canMoveToStarting}
          className={clsx(
            "px-2 py-1 rounded-lg text-xs font-medium transition-colors",
            isStarting
              ? "bg-gray-800 text-gray-400 hover:text-white"
              : canMoveToStarting
              ? "bg-gray-800 text-gray-400 hover:text-white"
              : "bg-gray-900 text-gray-700 cursor-not-allowed"
          )}
        >
          {isStarting ? t("teamBuilder.moveToBench") : t("teamBuilder.moveToStarting")}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function TeamBuilderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: season, isLoading: seasonLoading } = useSeason();

  const [step, setStep] = useState<1 | 2>(1);
  const [activePosition, setActivePosition] = useState<Position>("GK");
  const [search, setSearch] = useState("");
  const [squad, setSquad] = useState<SquadSlot[]>([]);
  const [teamName, setTeamName] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["players", activePosition],
    queryFn: () => fantasyApi.getPlayers({ position: activePosition }),
    enabled: !!season,
  });

  const mutation = useMutation({
    mutationFn: fantasyApi.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTeam"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      setSubmitError(extractApiError(err));
    },
  });

  if (seasonLoading) return <Spinner />;
  if (!season) return null;

  const ruleset = season.ruleset;
  const quota = ruleset.positions;
  const squadSize = ruleset.squad_size;
  const startingSize = ruleset.starting_size;
  const budget = ruleset.budget;
  const maxPerClub = ruleset.max_players_per_club;

  const budgetUsed = squad.reduce((sum, s) => sum + s.player.price, 0);
  const budgetLeft = budget - budgetUsed;

  const isInSquad = (id: number) => squad.some((s) => s.player.id === id);
  const countInPosition = (pos: Position) => squad.filter((s) => s.player.position === pos).length;
  const countInClub = (clubId: number) => squad.filter((s) => s.player.club_id === clubId).length;
  const startingCount = squad.filter((s) => s.isStarting).length;

  const canAdd = (player: Player) => {
    if (isInSquad(player.id)) return false;
    if (squad.length >= squadSize) return false;
    if (countInPosition(player.position) >= (quota[player.position] ?? 0)) return false;
    if (countInClub(player.club_id) >= maxPerClub) return false;
    if (player.price > budgetLeft) return false;
    return true;
  };

  const addPlayer = (player: Player) => {
    if (!canAdd(player)) return;
    const isStarting = startingCount < startingSize;
    setSquad((prev) => [...prev, { player, isStarting, isCaptain: false, isViceCaptain: false }]);
  };

  const removePlayer = (id: number) => {
    setSquad((prev) => {
      const removed = prev.find((s) => s.player.id === id);
      let updated = prev.filter((s) => s.player.id !== id);
      // if removed was captain/vc, clear those flags
      if (removed?.isCaptain) updated = updated.map((s) => ({ ...s, isCaptain: false }));
      if (removed?.isViceCaptain) updated = updated.map((s) => ({ ...s, isViceCaptain: false }));
      return updated;
    });
  };

  const toggleStarting = (id: number) => {
    setSquad((prev) => {
      const slot = prev.find((s) => s.player.id === id);
      if (!slot) return prev;
      if (slot.isStarting && startingCount <= 1) return prev;
      if (!slot.isStarting && startingCount >= startingSize) return prev;
      return prev.map((s) => (s.player.id === id ? { ...s, isStarting: !s.isStarting } : s));
    });
  };

  const setCaptain = (id: number) => {
    setSquad((prev) =>
      prev.map((s) => ({
        ...s,
        isCaptain: s.player.id === id,
        isViceCaptain: s.isViceCaptain && s.player.id !== id,
      }))
    );
  };

  const setViceCaptain = (id: number) => {
    setSquad((prev) =>
      prev.map((s) => ({
        ...s,
        isViceCaptain: s.player.id === id,
        isCaptain: s.isCaptain && s.player.id !== id,
      }))
    );
  };

  const handleSubmit = () => {
    setSubmitError("");
    if (!teamName.trim()) { setSubmitError(t("teamBuilder.noTeamName")); return; }
    if (!squad.some((s) => s.isCaptain)) { setSubmitError(t("teamBuilder.noCaptain")); return; }
    if (!squad.some((s) => s.isViceCaptain)) { setSubmitError(t("teamBuilder.noViceCaptain")); return; }

    const bench = squad.filter((s) => !s.isStarting);
    mutation.mutate({
      season_id: season.id,
      name: teamName.trim(),
      players: squad.map((s) => ({
        player_id: s.player.id,
        is_starting: s.isStarting,
        is_captain: s.isCaptain,
        is_vice_captain: s.isViceCaptain,
        ...(!s.isStarting
          ? { bench_order: bench.findIndex((b) => b.player.id === s.player.id) + 1 }
          : {}),
      })),
    });
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.display_name.toLowerCase().includes(search.toLowerCase()) ||
      p.club?.short_name?.toLowerCase().includes(search.toLowerCase())
  );

  const starting = squad.filter((s) => s.isStarting);
  const bench = squad.filter((s) => !s.isStarting);

  // ── STEP 1: Pick players ────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] -mx-4 -mt-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">{t("nav.dashboard")}</span>
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-500">{t("teamBuilder.budget")}</p>
              <p className={clsx("text-sm font-bold", budgetLeft < 0 ? "text-red-400" : "text-green-400")}>
                {fmtBudget(budgetLeft)} {t("teamBuilder.remaining")}
              </p>
            </div>
          </div>

          {/* Position tabs */}
          <div className="flex gap-1">
            {POSITIONS.map((pos) => {
              const count = countInPosition(pos);
              const max = quota[pos] ?? 0;
              const full = count >= max;
              return (
                <button
                  key={pos}
                  onClick={() => { setActivePosition(pos); setSearch(""); }}
                  className={clsx(
                    "flex-1 py-2 rounded-lg text-xs font-bold transition-colors",
                    activePosition === pos
                      ? "bg-green-500 text-white"
                      : full
                      ? "bg-gray-800 text-gray-500"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  )}
                >
                  {pos}
                  <span className="block text-[10px] font-normal opacity-75">
                    {count}/{max}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          {playersLoading ? (
            <div className="py-10 flex justify-center"><Spinner /></div>
          ) : filteredPlayers.length === 0 ? (
            <p className="text-center text-gray-600 py-10 text-sm">No players found</p>
          ) : (
            filteredPlayers.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                inSquad={isInSquad(player.id)}
                canAdd={canAdd(player)}
                onAdd={() => addPlayer(player)}
                onRemove={() => removePlayer(player.id)}
              />
            ))
          )}
        </div>

        {/* Sticky bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-4 py-4 md:relative md:border-t-0 md:bg-transparent">
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {t("teamBuilder.squadCount", { count: squad.length, total: squadSize })}
              </span>
              <div className="flex gap-3 text-xs text-gray-600">
                {POSITIONS.map((pos) => (
                  <span key={pos} className={clsx(countInPosition(pos) >= (quota[pos] ?? 0) && "text-green-500")}>
                    {pos} {countInPosition(pos)}/{quota[pos] ?? 0}
                  </span>
                ))}
              </div>
            </div>
            <button
              disabled={squad.length < squadSize}
              onClick={() => setStep(2)}
              className={clsx(
                "w-full py-3 rounded-xl font-semibold text-sm transition-colors",
                squad.length < squadSize
                  ? "bg-green-900 text-green-700 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-400 text-white"
              )}
            >
              {t("teamBuilder.next")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 2: Set lineup ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] -mx-4 -mt-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep(1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-white">{t("teamBuilder.title")}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-36 space-y-6 pt-4">
        {/* Team name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {t("teamBuilder.teamName")}
          </label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder={t("teamBuilder.teamNamePlaceholder")}
            maxLength={30}
            className="w-full bg-gray-900 border border-gray-800 focus:border-green-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none transition-colors"
          />
        </div>

        {/* Starting XI */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              {t("teamBuilder.startingXI")}
            </h2>
            <span className="text-xs text-gray-500">{starting.length}/{startingSize}</span>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-3">
            {starting.map((slot) => (
              <LineupRow
                key={slot.player.id}
                slot={slot}
                isStarting
                onToggleStarting={() => toggleStarting(slot.player.id)}
                onSetCaptain={() => setCaptain(slot.player.id)}
                onSetViceCaptain={() => setViceCaptain(slot.player.id)}
                canMoveToStarting={false}
              />
            ))}
          </div>
        </div>

        {/* Bench */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              {t("teamBuilder.bench")}
            </h2>
            <span className="text-xs text-gray-500">{bench.length}/{ruleset.bench_size}</span>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-3">
            {bench.map((slot) => (
              <LineupRow
                key={slot.player.id}
                slot={slot}
                isStarting={false}
                onToggleStarting={() => toggleStarting(slot.player.id)}
                onSetCaptain={() => setCaptain(slot.player.id)}
                onSetViceCaptain={() => setViceCaptain(slot.player.id)}
                canMoveToStarting={startingCount < startingSize}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-600">
          <span><span className="font-bold text-yellow-500">{t("teamBuilder.captain")}</span> = Captain (2× points)</span>
          <span><span className="font-bold text-blue-400">{t("teamBuilder.viceCaptain")}</span> = Vice Captain</span>
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-4 py-4 md:relative md:border-t-0 md:bg-transparent">
        <div className="max-w-lg mx-auto space-y-3">
          {submitError && (
            <p className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="flex-shrink-0" />
              {submitError}
            </p>
          )}
          {mutation.isSuccess && (
            <p className="text-green-400 text-sm flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <CheckCircle2 size={14} />
              Team created!
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className={clsx(
              "w-full py-3 rounded-xl font-semibold text-sm transition-colors",
              mutation.isPending
                ? "bg-green-800 text-green-600 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-400 text-white"
            )}
          >
            {mutation.isPending ? t("teamBuilder.creating") : t("teamBuilder.createTeam")}
          </button>
        </div>
      </div>
    </div>
  );
}
