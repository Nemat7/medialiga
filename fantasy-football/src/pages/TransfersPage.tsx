import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useMyTeam, usePlayers, useMakeTransfer } from "@/hooks/useFantasy";
import { extractApiError } from "@/api/auth";
import Spinner from "@/components/Spinner";
import { X, Search, CheckCircle } from "lucide-react";
import { clsx } from "clsx";
import type { Position } from "@/types";

// ─── Types ─────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

interface NormalizedPlayer {
  rawId: number;
  playerId: number;
  displayName: string;
  position: Position;
  price?: number;
  clubName?: string;
  isStarting: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

// ─── Normalize ─────────────────────────────────────────────────────────────────
const POS_MAP: Record<string, Position> = {
  GK: "GK", gk: "GK", goalkeeper: "GK",
  DEF: "DEF", def: "DEF", defender: "DEF",
  MID: "MID", mid: "MID", midfielder: "MID",
  FWD: "FWD", fwd: "FWD", forward: "FWD", att: "FWD", ATT: "FWD",
};

function normalize(raw: Raw): NormalizedPlayer | null {
  const inner = raw.player ?? raw;
  const posRaw: string = inner.position ?? raw.position ?? "";
  const pos = POS_MAP[posRaw];
  if (!pos) return null;
  return {
    rawId: raw.id ?? raw.player_id ?? inner.id,
    playerId: inner.id ?? raw.player_id,
    displayName: inner.display_name ?? inner.name ?? `#${inner.id}`,
    position: pos,
    price: inner.price,
    clubName: inner.club?.short_name ?? inner.club?.name ?? raw.club?.short_name,
    isStarting: raw.is_starting ?? false,
    isCaptain: raw.is_captain ?? false,
    isViceCaptain: raw.is_vice_captain ?? false,
  };
}

function extractPlayers(teamData: Raw | null | undefined): NormalizedPlayer[] {
  if (!teamData) return [];
  const arr: Raw[] =
    Array.isArray(teamData) ? teamData :
    Array.isArray(teamData.players) ? teamData.players :
    Array.isArray(teamData.team?.players) ? teamData.team.players :
    [];
  return arr.map(normalize).filter(Boolean) as NormalizedPlayer[];
}

// ─── Position styles ────────────────────────────────────────────────────────────
const POS_COLOR: Record<Position, string> = {
  GK: "bg-yellow-400 text-yellow-900 border-yellow-300",
  DEF: "bg-blue-500 text-white border-blue-300",
  MID: "bg-emerald-400 text-emerald-900 border-emerald-200",
  FWD: "bg-red-500 text-white border-red-300",
};

const POSITION_ROWS: Position[] = ["FWD", "MID", "DEF", "GK"];

function shortName(name: string) {
  const parts = name.trim().split(" ");
  return parts.length > 1 ? parts[parts.length - 1] : name;
}

// ─── Pitch player dot ───────────────────────────────────────────────────────────
function PitchPlayer({
  p,
  selected,
  onClick,
}: {
  p: NormalizedPlayer;
  selected: boolean;
  onClick: () => void;
}) {
  const label = shortName(p.displayName);
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-[3px] focus:outline-none"
    >
      <div
        className={clsx(
          "relative w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all",
          POS_COLOR[p.position],
          selected
            ? "ring-2 ring-white ring-offset-1 ring-offset-green-700 scale-110"
            : "hover:scale-105"
        )}
      >
        {label.substring(0, 2).toUpperCase()}
        {p.isCaptain && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-yellow-900 rounded-full text-[8px] font-bold flex items-center justify-center border border-yellow-200 shadow">
            C
          </span>
        )}
        {p.isViceCaptain && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-200 text-gray-800 rounded-full text-[8px] font-bold flex items-center justify-center border border-gray-300 shadow">
            V
          </span>
        )}
        {selected && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow" />
        )}
      </div>
      <div className="bg-black/70 backdrop-blur-sm rounded px-1.5 py-px text-white text-[9px] sm:text-[10px] font-medium max-w-[56px] sm:max-w-[64px] truncate text-center leading-tight">
        {label.length > 9 ? label.slice(0, 8) + "…" : label}
      </div>
    </button>
  );
}

// ─── Bench player row ───────────────────────────────────────────────────────────
function BenchPlayer({
  p,
  selected,
  onClick,
}: {
  p: NormalizedPlayer;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-col items-center gap-[3px] px-1 py-2 rounded-xl border transition-all w-full",
        selected
          ? "border-white/40 bg-white/10"
          : "border-white/10 hover:border-white/25 hover:bg-white/5"
      )}
    >
      <div
        className={clsx(
          "relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center text-[9px] sm:text-[10px] font-bold",
          POS_COLOR[p.position],
          "opacity-70"
        )}
      >
        {shortName(p.displayName).substring(0, 2).toUpperCase()}
        {selected && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
        )}
      </div>
      <span className="text-[8px] sm:text-[9px] text-white/70 font-medium max-w-[48px] truncate text-center leading-tight">
        {shortName(p.displayName).length > 7
          ? shortName(p.displayName).slice(0, 6) + "…"
          : shortName(p.displayName)}
      </span>
      <span className="text-[7px] sm:text-[8px] text-white/40 font-semibold">{p.position}</span>
    </button>
  );
}

// ─── Football pitch ─────────────────────────────────────────────────────────────
function Pitch({
  starting,
  bench,
  selected,
  onSelect,
}: {
  starting: NormalizedPlayer[];
  bench: NormalizedPlayer[];
  selected: NormalizedPlayer | null;
  onSelect: (p: NormalizedPlayer) => void;
}) {
  const grouped: Record<Position, NormalizedPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of starting) grouped[p.position].push(p);

  return (
    <div className="flex gap-2 sm:gap-3">
      {/* ── Pitch ── */}
      <div
        className="relative flex-1 rounded-xl overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1a6b2e 0%, #1d7a33 40%, #1a6b2e 100%)" }}
      >
        {/* Pitch markings */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Outer border */}
          <div className="absolute inset-2 border border-white/20 rounded-sm" />
          {/* Center line */}
          <div className="absolute left-4 right-4 top-1/2 h-px bg-white/25" />
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/25" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />
          {/* Top penalty box */}
          <div className="absolute top-2 left-[28%] right-[28%] h-[16%] border border-white/20 border-t-0" />
          {/* Bottom penalty box */}
          <div className="absolute bottom-2 left-[28%] right-[28%] h-[16%] border border-white/20 border-b-0" />
          {/* Top 6-yard box */}
          <div className="absolute top-2 left-[38%] right-[38%] h-[7%] border border-white/15 border-t-0" />
          {/* Bottom 6-yard box */}
          <div className="absolute bottom-2 left-[38%] right-[38%] h-[7%] border border-white/15 border-b-0" />
        </div>

        {/* Player rows — FWD at top, GK at bottom */}
        <div className="relative h-full flex flex-col justify-around py-5 sm:py-7">
          {POSITION_ROWS.map((pos) => {
            const row = grouped[pos];
            if (!row.length) return null;
            return (
              <div key={pos} className="flex justify-around items-center px-2">
                {row.map((p) => (
                  <PitchPlayer
                    key={p.rawId}
                    p={p}
                    selected={selected?.rawId === p.rawId}
                    onClick={() => onSelect(p)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bench ── */}
      <div
        className="flex flex-col gap-1.5 justify-around py-4 px-1 rounded-xl"
        style={{ background: "rgba(0,0,0,0.35)", minWidth: "56px" }}
      >
        <p className="text-center text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1">
          Bench
        </p>
        {bench.map((p) => (
          <BenchPlayer
            key={p.rawId}
            p={p}
            selected={selected?.rawId === p.rawId}
            onClick={() => onSelect(p)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Replacement bottom sheet ───────────────────────────────────────────────────
function ReplacementPanel({
  position,
  excludeIds,
  playerOut,
  onClose,
  onConfirm,
}: {
  position: Position;
  excludeIds: number[];
  playerOut: NormalizedPlayer;
  onClose: () => void;
  onConfirm: (playerInId: number) => void;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<number | null>(null);
  const { data: players = [], isLoading } = usePlayers({ position });

  const available = useMemo(() => {
    const filtered = players.filter((p) => !excludeIds.includes(p.id));
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        (p.club?.name ?? "").toLowerCase().includes(q)
    );
  }, [players, excludeIds, search]);

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-gray-950 border-t border-gray-800 rounded-t-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-800 flex-shrink-0">
          <div>
            <p className="text-white font-bold">{t("transfers.pickReplacement")}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              <span className="text-red-400 font-semibold">{t("transfers.out")}:</span>{" "}
              {playerOut.displayName}
              <span className="ml-1.5 text-gray-600">· {position}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-800 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("transfers.searchPlayer")}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {isLoading ? (
            <div className="py-10 flex justify-center"><Spinner /></div>
          ) : available.length === 0 ? (
            <p className="text-center text-gray-600 py-10">{t("transfers.noPlayers")}</p>
          ) : (
            available.map((p) => (
              <button
                key={p.id}
                onClick={() => setPicked(picked === p.id ? null : p.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                  picked === p.id
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-800 bg-gray-900 hover:border-gray-700"
                )}
              >
                <span className={clsx(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded w-9 text-center flex-shrink-0",
                  POS_COLOR[p.position]
                )}>
                  {p.position}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{p.display_name}</p>
                  <p className="text-gray-500 text-xs">{p.club?.short_name ?? p.club?.name ?? ""}</p>
                </div>
                {p.price != null && (
                  <span className="text-gray-400 text-xs font-medium flex-shrink-0">
                    {p.price} {t("transfers.coins")}
                  </span>
                )}
                {picked === p.id && <CheckCircle size={16} className="text-green-400 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>

        <div className="px-4 pb-6 pt-3 border-t border-gray-800 flex-shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!picked}
            onClick={() => picked && onConfirm(picked)}
            className={clsx(
              "flex-1 py-3.5 rounded-xl font-semibold text-sm transition-colors",
              picked
                ? "bg-green-500 hover:bg-green-400 text-white"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            )}
          >
            {t("transfers.confirmTransfer")}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function TransfersPage() {
  const { t } = useTranslation();
  const { data: teamData, isLoading, error } = useMyTeam();
  const { mutateAsync: makeTransfer, isPending } = useMakeTransfer();

  const [selected, setSelected] = useState<NormalizedPlayer | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [transferError, setTransferError] = useState("");

  const players = useMemo(() => extractPlayers(teamData), [teamData]);
  const starting = useMemo(() => players.filter((p) => p.isStarting), [players]);
  const bench = useMemo(() => players.filter((p) => !p.isStarting), [players]);
  const playerIds = useMemo(() => players.map((p) => p.playerId), [players]);

  const handleConfirm = async (playerInId: number) => {
    if (!selected) return;
    setTransferError("");
    try {
      await makeTransfer({ playerOutId: selected.playerId, playerInId });
      setSuccessMsg(t("transfers.success"));
      setSelected(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setTransferError(extractApiError(err));
    }
  };

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Failed to load your team.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t("transfers.title")}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{t("transfers.subtitle")}</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-green-400" />
          <p className="text-green-400 text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {transferError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{transferError}</p>
        </div>
      )}

      {players.length > 0 ? (
        <>
          {/* Hint */}
          {selected && (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
              <p className="text-green-400 text-sm">
                <span className="font-semibold">{selected.displayName}</span> selected — tap again to deselect or pick a replacement below
              </p>
              <button onClick={() => setSelected(null)} className="text-green-600 hover:text-green-400 ml-2 flex-shrink-0">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Pitch */}
          <Pitch
            starting={starting}
            bench={bench}
            selected={selected}
            onSelect={(p) => setSelected(selected?.rawId === p.rawId ? null : p)}
          />

          {/* Position legend */}
          <div className="flex gap-3 justify-center flex-wrap">
            {(["GK", "DEF", "MID", "FWD"] as Position[]).map((pos) => (
              <div key={pos} className="flex items-center gap-1.5">
                <div className={clsx("w-3 h-3 rounded-full border", POS_COLOR[pos])} />
                <span className="text-gray-500 text-xs">{pos}</span>
              </div>
            ))}
          </div>
        </>
      ) : teamData != null ? (
        /* Team exists but no players selected yet */
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-3xl">
            ⚽
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{t("transfers.emptySquadTitle")}</p>
            <p className="text-gray-500 text-sm mt-1">{t("transfers.emptySquadSubtitle")}</p>
          </div>
        </div>
      ) : (
        /* No team at all */
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-3xl">
            🏟️
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{t("transfers.noTeamTitle")}</p>
            <p className="text-gray-500 text-sm mt-1">{t("transfers.noTeamSubtitle")}</p>
          </div>
        </div>
      )}

      {/* Replacement sheet — opens when a player is selected */}
      {selected && !isPending && (
        <ReplacementPanel
          position={selected.position}
          excludeIds={playerIds}
          playerOut={selected}
          onClose={() => setSelected(null)}
          onConfirm={handleConfirm}
        />
      )}

      {isPending && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl px-8 py-6 flex flex-col items-center gap-3">
            <Spinner />
            <p className="text-white text-sm">{t("transfers.confirming")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
