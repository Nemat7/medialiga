import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, Activity, Plus, Edit2, Upload, Trash2, Search, X, ToggleLeft, ToggleRight, Calendar, SlidersHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { adminApi, resolveMediaUrl, type AdminClub, type AdminPlayer } from "@/api/admin";
import { fantasyApi } from "@/api/fantasy";
import { extractApiError } from "@/api/auth";
import RoundsTab from "./AdminRoundsTab";
import SeasonsTab from "./AdminSeasonsTab";
import RulesetsTab from "./AdminRulesetsTab";
import PlayerCardModal from "@/components/PlayerCardModal";

// ─── Shared Modal ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

// ─── Club Modal ───────────────────────────────────────────────────────────────

function ClubModal({
  club,
  seasonId,
  onClose,
}: {
  club?: AdminClub;
  seasonId: number;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState(club?.name ?? "");
  const [shortName, setShortName] = useState(club?.short_name ?? "");
  const [active, setActive] = useState(club?.status ?? true);
  const logoRef = useRef<HTMLInputElement>(null);

  const saveMutation = useMutation({
    mutationFn: () =>
      club
        ? adminApi.updateClub(club.id, { name, short_name: shortName, status: active })
        : adminApi.createClub({ season_id: seasonId, name, short_name: shortName, status: active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-clubs"] });
      onClose();
    },
    onError: (e) => alert(extractApiError(e, "Failed to save club")),
  });

  const logoMutation = useMutation({
    mutationFn: (file: File) => adminApi.uploadClubLogo(club!.id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-clubs"] }),
    onError: (e) => alert(extractApiError(e, "Logo upload failed")),
  });

  const deleteLogoMutation = useMutation({
    mutationFn: () => adminApi.deleteClubLogo(club!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-clubs"] }),
    onError: (e) => alert(extractApiError(e, "Failed to delete logo")),
  });

  return (
    <Modal title={club ? "Edit Club" : "New Club"} onClose={onClose}>
      <div className="space-y-4">
        <FormField label="Club Name">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FC Football Plus" />
        </FormField>

        <FormField label="Short Name (3–4 letters)">
          <input className={inputCls} value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="e.g. FCP" maxLength={5} />
        </FormField>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Active</span>
          <button onClick={() => setActive((v) => !v)} className="text-gray-400 hover:text-green-400 transition-colors">
            {active ? <ToggleRight size={28} className="text-green-400" /> : <ToggleLeft size={28} />}
          </button>
        </div>

        {club && (
          <div className="pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-400 mb-2">Club Logo</p>
            <div className="flex items-center gap-3">
              {club.logo && (
                <img src={resolveMediaUrl(club.logo)!} alt="logo" className="w-12 h-12 rounded-lg object-contain bg-gray-800 p-1" />
              )}
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                if (e.target.files?.[0]) logoMutation.mutate(e.target.files[0]);
              }} />
              <button
                onClick={() => logoRef.current?.click()}
                disabled={logoMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
              >
                <Upload size={14} />
                {logoMutation.isPending ? "Uploading..." : "Upload"}
              </button>
              {club.logo && (
                <button
                  onClick={() => deleteLogoMutation.mutate()}
                  disabled={deleteLogoMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !name || !shortName}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Player Modal ─────────────────────────────────────────────────────────────

function PlayerModal({
  player,
  seasonId,
  clubs,
  onClose,
}: {
  player?: AdminPlayer;
  seasonId: number;
  clubs: AdminClub[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const photoRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(player?.display_name ?? "");
  const [clubId, setClubId] = useState<number>(player?.club_id ?? (clubs[0]?.id ?? 0));
  const [position, setPosition] = useState(player?.position ?? "MID");
  const [price, setPrice] = useState(player?.price ?? 10);
  const [status, setStatus] = useState(player?.status ?? "active");

  const saveMutation = useMutation({
    mutationFn: () =>
      player
        ? adminApi.updatePlayer(player.id, {
            display_name: displayName,
            price,
            status,
            // position changes are rejected by the API once a round has started —
            // send it only when the admin actually changed it
            ...(position !== player.position ? { position } : {}),
          })
        : adminApi.createPlayer({ season_id: seasonId, club_id: clubId, display_name: displayName, position, price, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-players"] });
      onClose();
    },
    onError: (e) => alert(extractApiError(e, "Failed to save player")),
  });

  const photoMutation = useMutation({
    mutationFn: (file: File) => adminApi.uploadPlayerPhoto(player!.id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-players"] }),
    onError: (e) => alert(extractApiError(e, "Photo upload failed")),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: () => adminApi.deletePlayerPhoto(player!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-players"] }),
    onError: (e) => alert(extractApiError(e, "Failed to delete photo")),
  });

  return (
    <Modal title={player ? "Edit Player" : "New Player"} onClose={onClose}>
      <div className="space-y-4">
        <FormField label="Display Name">
          <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Alisher Sabirov" />
        </FormField>

        {!player && (
          <FormField label="Club">
            <select className={selectCls} value={clubId} onChange={(e) => setClubId(Number(e.target.value))}>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
        )}

        <FormField label="Position">
          <select className={selectCls} value={position} onChange={(e) => setPosition(e.target.value as AdminPlayer["position"])}>
            {["GK", "DEF", "MID", "FWD"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Price (M)">
          <input type="number" className={inputCls} value={price} min={1} onChange={(e) => setPrice(Number(e.target.value))} />
        </FormField>

        <FormField label="Status">
          <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as AdminPlayer["status"])}>
            <option value="active">Active</option>
            <option value="injured">Injured</option>
            <option value="suspended">Suspended</option>
          </select>
        </FormField>

        {player && (
          <div className="pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-400 mb-2">Player Photo</p>
            <div className="flex items-center gap-3">
              {player.photo && (
                <img src={resolveMediaUrl(player.photo)!} alt="photo" className="w-12 h-12 rounded-lg object-cover bg-gray-800" />
              )}
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                if (e.target.files?.[0]) photoMutation.mutate(e.target.files[0]);
              }} />
              <button
                onClick={() => photoRef.current?.click()}
                disabled={photoMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
              >
                <Upload size={14} />
                {photoMutation.isPending ? "Uploading..." : "Upload Photo"}
              </button>
              {player.photo && (
                <button
                  onClick={() => deletePhotoMutation.mutate()}
                  disabled={deletePhotoMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !displayName}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Clubs Tab ────────────────────────────────────────────────────────────────

function ClubsTab({ seasonId }: { seasonId: number }) {
  const qc = useQueryClient();
  const [modalClub, setModalClub] = useState<AdminClub | null | "new">(null);

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ["admin-clubs", seasonId],
    queryFn: () => adminApi.getClubs(seasonId),
  });

  const toggleMutation = useMutation({
    mutationFn: (club: AdminClub) => adminApi.updateClub(club.id, { name: club.name, short_name: club.short_name, status: !club.status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-clubs"] }),
    onError: (e) => alert(extractApiError(e, "Failed to update")),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">{clubs.length} clubs</p>
        <button
          onClick={() => setModalClub("new")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold"
        >
          <Plus size={15} />
          New Club
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-2">
          {clubs.map((club) => (
            <div key={club.id} className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {club.logo
                  ? <img src={resolveMediaUrl(club.logo)!} alt={club.short_name} className="w-full h-full object-contain p-1" />
                  : <Shield size={16} className="text-gray-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{club.name}</p>
                <p className="text-gray-500 text-xs">{club.short_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMutation.mutate(club)}
                  disabled={toggleMutation.isPending}
                  className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", club.status ? "bg-green-500/15 text-green-400" : "bg-gray-800 text-gray-500")}
                >
                  {club.status ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => setModalClub(club)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modalClub === "new" || (modalClub && typeof modalClub === "object")) && (
        <ClubModal
          club={modalClub === "new" ? undefined : modalClub}
          seasonId={seasonId}
          onClose={() => setModalClub(null)}
        />
      )}
    </div>
  );
}

// ─── Players Tab ──────────────────────────────────────────────────────────────

const POSITIONS = ["All", "GK", "DEF", "MID", "FWD"] as const;

function PlayersTab({ seasonId, clubs }: { seasonId: number; clubs: AdminClub[] }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterClub, setFilterClub] = useState<number | undefined>();
  const [filterPos, setFilterPos] = useState<string>("All");
  const [modalPlayer, setModalPlayer] = useState<AdminPlayer | null | "new">(null);
  const [cardPlayerId, setCardPlayerId] = useState<number | null>(null);

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["admin-players", filterClub, filterPos, search],
    queryFn: () =>
      adminApi.getPlayers({
        club_id: filterClub,
        position: filterPos === "All" ? undefined : filterPos,
        search: search || undefined,
      }),
  });

  const activateMutation = useMutation({
    mutationFn: (p: AdminPlayer) => p.status === "active" ? adminApi.deactivatePlayer(p.id) : adminApi.activatePlayer(p.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-players"] }),
    onError: (e) => alert(extractApiError(e, "Failed to update status")),
  });

  const posColor: Record<string, string> = {
    GK: "text-yellow-400 bg-yellow-400/10",
    DEF: "text-blue-400 bg-blue-400/10",
    MID: "text-green-400 bg-green-400/10",
    FWD: "text-red-400 bg-red-400/10",
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            placeholder="Search player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          value={filterClub ?? ""}
          onChange={(e) => setFilterClub(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">All clubs</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.short_name}</option>)}
        </select>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setFilterPos(pos)}
              className={clsx("px-2.5 py-1 rounded text-xs font-medium transition-colors", filterPos === pos ? "bg-green-600 text-white" : "text-gray-400 hover:text-white")}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-sm">{players.length} players</p>
        <button
          onClick={() => setModalPlayer("new")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold"
        >
          <Plus size={15} />
          New Player
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-2">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <button
                onClick={() => setCardPlayerId(player.id)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                title="Show player card"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden">
                  {player.photo
                    ? <img src={resolveMediaUrl(player.photo)!} alt={player.display_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">{player.display_name.slice(0, 2).toUpperCase()}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate hover:text-green-400 transition-colors">{player.display_name}</p>
                  <p className="text-gray-500 text-xs">{player.club?.short_name ?? `Club #${player.club_id}`} · {player.price}M</p>
                </div>
              </button>
              <span className={clsx("px-2 py-0.5 rounded text-xs font-bold", posColor[player.position] ?? "text-gray-400")}>
                {player.position}
              </span>
              <button
                onClick={() => activateMutation.mutate(player)}
                disabled={activateMutation.isPending}
                className={clsx("px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0", player.status === "active" ? "bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400" : "bg-gray-800 text-gray-500 hover:bg-green-500/15 hover:text-green-400")}
                title={player.status === "active" ? "Click to deactivate" : "Click to activate"}
              >
                {player.status === "active" ? "Active" : player.status === "injured" ? "Injured" : "Suspended"}
              </button>
              <button
                onClick={() => setModalPlayer(player)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
              >
                <Edit2 size={14} />
              </button>
            </div>
          ))}

          {players.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              No players found
            </div>
          )}
        </div>
      )}

      {(modalPlayer === "new" || (modalPlayer && typeof modalPlayer === "object")) && (
        <PlayerModal
          player={modalPlayer === "new" ? undefined : modalPlayer}
          seasonId={seasonId}
          clubs={clubs}
          onClose={() => setModalPlayer(null)}
        />
      )}

      {cardPlayerId != null && (
        <PlayerCardModal playerId={cardPlayerId} onClose={() => setCardPlayerId(null)} />
      )}
    </div>
  );
}


// ─── Main Admin Page ──────────────────────────────────────────────────────────

type Tab = "clubs" | "players" | "rounds" | "seasons" | "rulesets";

const TABS: { id: Tab; label: string; icon: typeof Shield }[] = [
  { id: "clubs", label: "Clubs", icon: Shield },
  { id: "players", label: "Players", icon: Users },
  { id: "rounds", label: "Rounds", icon: Activity },
  { id: "seasons", label: "Seasons", icon: Calendar },
  { id: "rulesets", label: "Rulesets", icon: SlidersHorizontal },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("clubs");

  const { data: season, isLoading: seasonLoading } = useQuery({
    queryKey: ["season"],
    queryFn: fantasyApi.getActiveSeason,
    retry: false,
  });

  // Fallback when no season is active yet: the admin still needs to add clubs
  // and players to a draft season before it can be activated.
  const { data: allSeasons = [], isLoading: seasonsLoading } = useQuery({
    queryKey: ["admin-seasons"],
    queryFn: () => adminApi.getSeasons(),
  });

  // The season we scope Clubs/Players to: the active one, else the newest draft.
  const draftSeason = [...allSeasons]
    .filter((s) => s.status !== "finished")
    .sort((a, b) => b.id - a.id)[0];
  const workingSeasonId = season?.id ?? draftSeason?.id;
  const workingSeasonName = season?.name ?? draftSeason?.name;

  const { data: clubs = [] } = useQuery({
    queryKey: ["admin-clubs", workingSeasonId],
    queryFn: () => adminApi.getClubs(workingSeasonId),
    enabled: !!workingSeasonId,
  });

  if (seasonLoading || seasonsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const noSeasonNotice = (
    <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-gray-800 rounded-xl">
      No season yet. Create a season in the Seasons tab first.
    </div>
  );
  const activateHint = (
    <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-gray-800 rounded-xl">
      Rounds can be managed once the season is active. Add clubs & players, then Activate it in the Seasons tab.
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">
          {season
            ? `Active season: ${season.name}`
            : workingSeasonName
            ? `Draft season: ${workingSeasonName} (not active yet)`
            : "No season"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === id ? "bg-green-600/20 text-green-400" : "text-gray-400 hover:text-white"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "clubs" &&
        (workingSeasonId ? <ClubsTab seasonId={workingSeasonId} /> : noSeasonNotice)}
      {activeTab === "players" &&
        (workingSeasonId ? <PlayersTab seasonId={workingSeasonId} clubs={clubs} /> : noSeasonNotice)}
      {activeTab === "rounds" && (season ? <RoundsTab season={season} clubs={clubs} /> : activateHint)}
      {activeTab === "seasons" && <SeasonsTab />}
      {activeTab === "rulesets" && <RulesetsTab />}
    </div>
  );
}
