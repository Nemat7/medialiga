import { useState } from "react";
import { usePlayers, useClubs } from "@/hooks/useFantasy";
import Spinner from "@/components/Spinner";
import PositionBadge from "@/components/PositionBadge";
import type { Position } from "@/types";
import { Search, User } from "lucide-react";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { resolveMediaUrl } from "@/api/admin";

const POSITIONS: { labelKey: string; value: Position | "" }[] = [
  { labelKey: "players.allPositions", value: "" },
  { labelKey: "GK", value: "GK" },
  { labelKey: "DEF", value: "DEF" },
  { labelKey: "MID", value: "MID" },
  { labelKey: "FWD", value: "FWD" },
];

export default function PlayersPage() {
  const { t } = useTranslation();
  const [position, setPosition] = useState<Position | "">("");
  const [clubId, setClubId] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: clubs } = useClubs();
  const { data: players, isLoading } = usePlayers({
    position: position || undefined,
    club_id: clubId,
    search: debouncedSearch || undefined,
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as unknown as { _st: number })._st);
    (window as unknown as { _st: ReturnType<typeof setTimeout> })._st = setTimeout(
      () => setDebouncedSearch(val),
      400
    );
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">{t("players.title")}</h1>
        {players && (
          <span className="text-gray-500 text-sm">{players.length} {t("nav.players").toLowerCase()}</span>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={t("players.search")}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-600 transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {POSITIONS.map(({ labelKey, value }) => (
            <button
              key={labelKey}
              onClick={() => setPosition(value)}
              className={clsx(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                position === value
                  ? "bg-green-500 text-white"
                  : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
              )}
            >
              {labelKey.startsWith("players.") ? t(labelKey) : labelKey}
            </button>
          ))}
        </div>

        <select
          value={clubId ?? ""}
          onChange={(e) => setClubId(e.target.value ? Number(e.target.value) : undefined)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-600 transition-colors"
        >
          <option value="">{t("players.allClubs")}</option>
          {clubs?.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
      </div>

      {/* Players grid */}
      {isLoading ? (
        <Spinner />
      ) : !players?.length ? (
        <p className="text-center text-gray-600 py-16">{t("players.noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex items-center gap-4 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {player.photo ? (
                  <img src={resolveMediaUrl(player.photo)!} alt={player.display_name} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-gray-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate text-sm">{player.display_name}</p>
                <p className="text-gray-500 text-xs truncate">{player.club.short_name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <PositionBadge position={player.position} />
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-green-400 font-bold text-sm">{player.price}</p>
                <p className="text-gray-600 text-xs">{t("players.coins")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
