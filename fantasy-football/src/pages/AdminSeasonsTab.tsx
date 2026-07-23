import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Edit2, Calendar, Trophy, Play, Flag } from "lucide-react";
import { clsx } from "clsx";
import {
  adminApi,
  type AdminSeason,
  type AdminSeasonPayload,
  type CompetitionConfig,
} from "@/api/admin";
import { extractApiError } from "@/api/auth";

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-700 text-gray-400",
  upcoming: "bg-blue-500/15 text-blue-400",
  active: "bg-green-500/15 text-green-400",
  finished: "bg-yellow-500/15 text-yellow-400",
};

const DEFAULT_CONFIG: CompetitionConfig = {
  playoff_teams: 4,
  playoff_leg_mode: "single",
  final_leg_mode: "single",
  seeding_mode: "seeded",
  has_third_place_match: true,
};

function fmtDate(s: string) {
  if (!s) return "";
  return new Date(s).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Season modal ─────────────────────────────────────────────────────────────
function SeasonModal({ season, onClose }: { season?: AdminSeason; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(season?.name ?? "");
  const [dateFrom, setDateFrom] = useState(season?.date_from?.slice(0, 10) ?? "");
  const [dateTo, setDateTo] = useState(season?.date_to?.slice(0, 10) ?? "");
  const [rulesetId, setRulesetId] = useState<number>(season?.ruleset_id ?? 0);
  const [formatId, setFormatId] = useState<number>(season?.competition_format_id ?? 0);
  const [withPlayoffs, setWithPlayoffs] = useState<boolean>(!!season?.competition_config);
  const [config, setConfig] = useState<CompetitionConfig>(
    season?.competition_config ?? { ...DEFAULT_CONFIG }
  );
  const [error, setError] = useState("");

  const { data: rulesets = [] } = useQuery({
    queryKey: ["admin-rulesets"],
    queryFn: () => adminApi.getRulesets(),
  });
  const { data: formats = [] } = useQuery({
    queryKey: ["admin-competition-formats"],
    queryFn: adminApi.getCompetitionFormats,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const payload: AdminSeasonPayload = {
        ruleset_id: rulesetId,
        competition_format_id: formatId,
        name: name.trim(),
        date_from: dateFrom,
        date_to: dateTo,
        ...(withPlayoffs ? { competition_config: config } : {}),
      };
      return season ? adminApi.updateSeason(season.id, payload) : adminApi.createSeason(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-seasons"] });
      qc.invalidateQueries({ queryKey: ["season"] });
      onClose();
    },
    onError: (e) => setError(extractApiError(e, "Failed to save season")),
  });

  const setCfg = (patch: Partial<CompetitionConfig>) => setConfig((c) => ({ ...c, ...patch }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-white font-semibold text-lg">{season ? "Edit Season" : "New Season"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Season Name</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Медиалига 2027"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Date from</label>
              <input type="date" className={inputCls} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Date to</label>
              <input type="date" className={inputCls} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Ruleset</label>
            <select className={selectCls} value={rulesetId} onChange={(e) => setRulesetId(Number(e.target.value))}>
              <option value={0}>Select ruleset...</option>
              {rulesets.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Competition Format</label>
            <select className={selectCls} value={formatId} onChange={(e) => setFormatId(Number(e.target.value))}>
              <option value={0}>Select format...</option>
              {formats.map((f) => (
                <option key={f.id} value={f.id}>
                  #{f.id} {f.name ?? f.code ?? `Format ${f.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Playoffs */}
          <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-4 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-white text-sm font-medium flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400" />
                Playoff configuration
              </span>
              <input
                type="checkbox"
                checked={withPlayoffs}
                onChange={(e) => setWithPlayoffs(e.target.checked)}
                className="w-4 h-4 accent-green-500 cursor-pointer"
              />
            </label>

            {withPlayoffs && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Playoff teams</label>
                    <select
                      className={selectCls}
                      value={config.playoff_teams}
                      onChange={(e) => setCfg({ playoff_teams: Number(e.target.value) })}
                    >
                      {[2, 4, 8, 16].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Seeding</label>
                    <select
                      className={selectCls}
                      value={config.seeding_mode}
                      onChange={(e) => setCfg({ seeding_mode: e.target.value as CompetitionConfig["seeding_mode"] })}
                    >
                      <option value="seeded">Seeded (1st vs last...)</option>
                      <option value="random">Random draw</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Playoff ties</label>
                    <select
                      className={selectCls}
                      value={config.playoff_leg_mode}
                      onChange={(e) => setCfg({ playoff_leg_mode: e.target.value as CompetitionConfig["playoff_leg_mode"] })}
                    >
                      <option value="single">Single leg</option>
                      <option value="double">Two legs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Final</label>
                    <select
                      className={selectCls}
                      value={config.final_leg_mode}
                      onChange={(e) => setCfg({ final_leg_mode: e.target.value as CompetitionConfig["final_leg_mode"] })}
                    >
                      <option value="single">Single leg</option>
                      <option value="double">Two legs</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-300 text-sm">Third place match</span>
                  <input
                    type="checkbox"
                    checked={config.has_third_place_match}
                    onChange={(e) => setCfg({ has_third_place_match: e.target.checked })}
                    className="w-4 h-4 accent-green-500 cursor-pointer"
                  />
                </label>
              </div>
            )}
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
                if (!name.trim()) return setError("Name is required");
                if (!dateFrom || !dateTo) return setError("Both dates are required");
                if (!rulesetId) return setError("Select a ruleset");
                if (!formatId) return setError("Select a competition format");
                mutation.mutate();
              }}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
            >
              {mutation.isPending ? "Saving..." : "Save Season"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Seasons tab ──────────────────────────────────────────────────────────────
export default function SeasonsTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<AdminSeason | "new" | null>(null);

  const { data: seasons = [], isLoading } = useQuery({
    queryKey: ["admin-seasons"],
    queryFn: () => adminApi.getSeasons(),
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-seasons"] });
    qc.invalidateQueries({ queryKey: ["season"] });
  };

  const activateMutation = useMutation({
    mutationFn: (id: number) => adminApi.activateSeason(id),
    onSuccess: refresh,
    onError: (e) => alert(extractApiError(e, "Failed to activate season")),
  });

  const finishMutation = useMutation({
    mutationFn: (id: number) => adminApi.finishSeason(id),
    onSuccess: refresh,
    onError: (e) => alert(extractApiError(e, "Failed to finish season")),
  });

  const busy = activateMutation.isPending || finishMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">{seasons.length} seasons</p>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold"
        >
          <Plus size={15} />
          New Season
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-2">
          {seasons.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{s.name}</p>
                <p className="text-gray-500 text-xs">
                  {fmtDate(s.date_from)} — {fmtDate(s.date_to)}
                  {s.competition_config ? " · playoffs" : ""}
                </p>
              </div>
              <span
                className={clsx(
                  "px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0",
                  STATUS_BADGE[s.status] ?? "bg-blue-500/15 text-blue-400"
                )}
              >
                {s.status}
              </span>

              {s.status !== "active" && s.status !== "finished" && (
                <button
                  onClick={() => activateMutation.mutate(s.id)}
                  disabled={busy}
                  title="Activate this season (makes it the public active season)"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex-shrink-0"
                >
                  <Play size={12} />
                  Activate
                </button>
              )}
              {s.status === "active" && (
                <button
                  onClick={() => {
                    if (!window.confirm(`Finish "${s.name}"? It will no longer be the active season.`)) return;
                    finishMutation.mutate(s.id);
                  }}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-semibold flex-shrink-0"
                >
                  <Flag size={12} />
                  Finish
                </button>
              )}

              <button
                onClick={() => setModal(s)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
              >
                <Edit2 size={14} />
              </button>
            </div>
          ))}
          {seasons.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-gray-800 rounded-xl">
              No seasons yet — create the first one.
            </div>
          )}
        </div>
      )}

      {modal && (
        <SeasonModal season={modal === "new" ? undefined : modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
