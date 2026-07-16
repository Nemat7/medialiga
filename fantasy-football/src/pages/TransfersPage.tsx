import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMyTeam, usePlayers, useMakeTransfer } from "@/hooks/useFantasy";
import { extractApiError } from "@/api/auth";
import { resolveMediaUrl } from "@/api/admin";
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
  photo?: string | null;
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
    // The real fantasy player id — team/me rows carry it as fantasy_player_id,
    // while raw.id is the team-roster row id (invalid for transfers)
    playerId: raw.fantasy_player_id ?? raw.player_id ?? inner.id,
    displayName: inner.display_name ?? inner.name ?? `#${inner.id}`,
    position: pos,
    price: inner.price ?? raw.current_price ?? raw.purchase_price,
    clubName: inner.club?.short_name ?? inner.club?.name ?? raw.club?.short_name,
    photo: inner.photo ?? raw.photo ?? null,
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

const POSITION_ROWS: Position[] = ["GK", "DEF", "MID", "FWD"];

function shortName(name: string) {
  const parts = name.trim().split(" ");
  return parts.length > 1 ? parts[parts.length - 1] : name;
}

// ─── Player card (FPL-style: photo card + white name/club plates) ──────────────
function PlayerCard({
  p,
  selected,
  onClick,
  small = false,
}: {
  p: NormalizedPlayer;
  selected: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  const label = shortName(p.displayName);
  return (
    <button onClick={onClick} className="flex flex-col items-center focus:outline-none group">
      <div
        className={clsx(
          "relative aspect-[3/4] rounded-lg border-2 flex items-center justify-center font-bold transition-all",
          small ? "w-10 sm:w-12 text-[10px] sm:text-xs" : "w-12 sm:w-16 text-xs sm:text-base",
          POS_COLOR[p.position],
          selected ? "ring-2 ring-white scale-105" : "group-hover:scale-105"
        )}
      >
        {p.photo ? (
          <img
            src={resolveMediaUrl(p.photo)!}
            alt=""
            className="w-full h-full rounded-md object-cover"
          />
        ) : (
          label.substring(0, 2).toUpperCase()
        )}
        {p.isCaptain && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow border border-white/30">
            C
          </span>
        )}
        {p.isViceCaptain && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow border border-white/30">
            V
          </span>
        )}
      </div>
      {/* Name & club plates */}
      <div
        className={clsx(
          "relative z-10 -mt-1 rounded-md overflow-hidden shadow-md",
          small ? "w-16 sm:w-20" : "w-[76px] sm:w-24"
        )}
      >
        <p
          className={clsx(
            "bg-white text-gray-900 font-bold truncate px-1.5 text-center leading-tight",
            small ? "text-[8px] sm:text-[10px] py-[3px]" : "text-[10px] sm:text-xs py-1"
          )}
        >
          {label}
        </p>
        <p
          className={clsx(
            "bg-gray-200 text-gray-600 font-medium truncate px-1.5 text-center leading-tight",
            small ? "text-[7px] sm:text-[9px] py-[2px]" : "text-[9px] sm:text-[10px] py-[3px]"
          )}
        >
          {p.clubName ?? p.position}
        </p>
      </div>
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

  // Bench slot labels like FPL: GKP, 1. DEF, 2. FWD...
  let benchN = 0;
  const benchTags = bench.map((p) => (p.position === "GK" ? "GKP" : `${++benchN}. ${p.position}`));

  return (
    <div className="flex gap-2 sm:gap-3">
    {/* ── Pitch ── */}
    <div
      className="relative flex-1 rounded-2xl overflow-hidden flex flex-col border border-white/10 shadow-2xl"
      style={{
        // bright FPL-style grass with mowing stripes
        background:
          "repeating-linear-gradient(0deg, #3da35b 0px, #3da35b 44px, #47b167 44px, #47b167 88px)",
      }}
    >
      {/* Half-pitch markings in perspective (goal at the top) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 640"
        preserveAspectRatio="none"
      >
        <g stroke="rgba(255,255,255,0.85)" strokeWidth="2" fill="none">
          {/* goal line */}
          <path d="M78 52 H322" />
          {/* touchlines running towards the viewer */}
          <path d="M78 52 L4 640" />
          <path d="M322 52 L396 640" />
          {/* penalty box */}
          <path d="M136 52 L122 158 H278 L264 52" />
          {/* six-yard box */}
          <path d="M170 52 L164 100 H236 L230 52" />
          {/* goal */}
          <path d="M176 52 V26 H224 V52" opacity="0.8" />
          {/* penalty arc */}
          <path d="M162 158 Q200 190 238 158" />
        </g>
        <circle cx="200" cy="128" r="3" fill="rgba(255,255,255,0.85)" />
      </svg>

      {/* Player rows — GK at the top near the goal */}
      <div className="relative flex flex-col justify-around gap-3 sm:gap-5 pt-14 sm:pt-20 pb-4 px-2 min-h-[420px] sm:min-h-[530px]">
        {POSITION_ROWS.map((pos) => {
          const row = grouped[pos];
          if (!row.length) return null;
          return (
            <div key={pos} className="flex justify-around items-start px-1">
              {row.map((p) => (
                <PlayerCard
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

    {/* ── Bench (right side) ── */}
    <div className="flex flex-col gap-2 justify-around py-3 px-1.5 sm:px-2 rounded-2xl bg-gray-900/70 border border-gray-800">
      <p className="text-center text-[8px] sm:text-[9px] text-white/40 font-bold uppercase tracking-widest">
        Bench
      </p>
      {bench.map((p, i) => (
        <div key={p.rawId} className="flex flex-col items-center gap-1">
          <span className="text-[8px] sm:text-[9px] font-bold text-white/60 uppercase tracking-wide">
            {benchTags[i]}
          </span>
          <PlayerCard
            p={p}
            small
            selected={selected?.rawId === p.rawId}
            onClick={() => onSelect(p)}
          />
        </div>
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
  const navigate = useNavigate();
  const { data: teamData, isLoading, error } = useMyTeam();
  const { mutateAsync: makeTransfer, isPending } = useMakeTransfer();

  const [selected, setSelected] = useState<NormalizedPlayer | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [transferError, setTransferError] = useState("");

  // team/me rows carry no photo — take it from the public players list by id
  const { data: allPlayers = [] } = usePlayers();
  const photoMap = useMemo(
    () => new Map(allPlayers.map((p) => [p.id, p.photo])),
    [allPlayers]
  );

  const players = useMemo(
    () =>
      extractPlayers(teamData).map((p) =>
        p.photo ? p : { ...p, photo: photoMap.get(p.playerId) ?? null }
      ),
    [teamData, photoMap]
  );
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
          <button
            onClick={() => navigate("/team/create")}
            className="mt-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {t("transfers.buildTeam")}
          </button>
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
          <button
            onClick={() => navigate("/team/create")}
            className="mt-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {t("transfers.buildTeam")}
          </button>
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
