import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Edit2, SlidersHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { adminApi, type AdminRuleset, type AdminRulesetPayload } from "@/api/admin";
import { extractApiError } from "@/api/auth";
import type { Position } from "@/types";

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 transition-colors";

const POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"];

const DEFAULT_PAYLOAD: AdminRulesetPayload = {
  name: "",
  squad_size: 14,
  starting_size: 10,
  bench_size: 4,
  budget: 1000,
  max_players_per_club: 3,
  positions: { GK: 2, DEF: 4, MID: 5, FWD: 3 },
  starting_min: { GK: 1, DEF: 3, MID: 3, FWD: 1 },
  scoring_rules: {
    captain_multiplier: 2,
    triple_captain_multiplier: 3,
    played_60_minutes: 1,
    goal: { GK: 6, DEF: 6, MID: 5, FWD: 4 },
    assist: 3,
    clean_sheet: { GK: 4, DEF: 4, MID: 1, FWD: 0 },
    yellow_card: -1,
    red_card: -3,
    own_goal: -2,
    missed_penalty: -2,
    player_of_match: 3,
  },
  transfer_rules: {
    free_transfers_per_round: 1,
    max_saved_transfers: 5,
    extra_transfer_penalty: -4,
  },
  chip_rules: {
    triple_captain: 1,
    bench_boost: 1,
    wildcard: 1,
    free_hit: 1,
  },
  status: true,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-4">
      <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-3">{title}</p>
      {children}
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div>
      <label className="block text-[11px] text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        className={inputCls}
        value={value}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function PosQuad({
  label,
  values,
  onChange,
}: {
  label: string;
  values: Record<Position, number>;
  onChange: (values: Record<Position, number>) => void;
}) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {POSITIONS.map((pos) => (
          <div key={pos}>
            <label className="block text-[10px] text-gray-500 mb-0.5 text-center">{pos}</label>
            <input
              type="number"
              className={`${inputCls} text-center`}
              value={values[pos]}
              onChange={(e) => onChange({ ...values, [pos]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Ruleset modal ────────────────────────────────────────────────────────────
function RulesetModal({ ruleset, onClose }: { ruleset?: AdminRuleset; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<AdminRulesetPayload>(() =>
    ruleset
      ? {
          name: ruleset.name,
          squad_size: ruleset.squad_size,
          starting_size: ruleset.starting_size,
          bench_size: ruleset.bench_size,
          budget: ruleset.budget,
          max_players_per_club: ruleset.max_players_per_club,
          positions: { ...ruleset.positions },
          starting_min: { ...ruleset.starting_min },
          scoring_rules: {
            ...ruleset.scoring_rules,
            goal: { ...ruleset.scoring_rules.goal },
            clean_sheet: { ...ruleset.scoring_rules.clean_sheet },
          },
          transfer_rules: { ...ruleset.transfer_rules },
          chip_rules: { ...ruleset.chip_rules },
        }
      : { ...DEFAULT_PAYLOAD }
  );
  const [error, setError] = useState("");

  const set = (patch: Partial<AdminRulesetPayload>) => setForm((f) => ({ ...f, ...patch }));
  const setScoring = (patch: Partial<AdminRulesetPayload["scoring_rules"]>) =>
    setForm((f) => ({ ...f, scoring_rules: { ...f.scoring_rules, ...patch } }));

  const mutation = useMutation({
    mutationFn: () =>
      ruleset ? adminApi.updateRuleset(ruleset.id, form) : adminApi.createRuleset(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rulesets"] });
      onClose();
    },
    onError: (e) => setError(extractApiError(e, "Failed to save ruleset")),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-white font-semibold text-lg">
            {ruleset ? "Edit Ruleset" : "New Ruleset"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Section title="Basics">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Name</label>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="e.g. Media League Ruleset 2027"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Num label="Budget" value={form.budget} min={1} onChange={(v) => set({ budget: v })} />
                <Num label="Squad size" value={form.squad_size} min={1} onChange={(v) => set({ squad_size: v })} />
                <Num label="Starting XI" value={form.starting_size} min={1} onChange={(v) => set({ starting_size: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Num label="Bench size" value={form.bench_size} min={0} onChange={(v) => set({ bench_size: v })} />
                <Num label="Max players per club" value={form.max_players_per_club} min={1} onChange={(v) => set({ max_players_per_club: v })} />
              </div>
            </div>
          </Section>

          <Section title="Squad composition">
            <div className="space-y-3">
              <PosQuad label="Players per position (squad quota)" values={form.positions} onChange={(v) => set({ positions: v })} />
              <PosQuad label="Minimum in starting lineup" values={form.starting_min} onChange={(v) => set({ starting_min: v })} />
            </div>
          </Section>

          <Section title="Scoring — goals & clean sheets">
            <div className="space-y-3">
              <PosQuad
                label="Points per goal"
                values={form.scoring_rules.goal}
                onChange={(v) => setScoring({ goal: v })}
              />
              <PosQuad
                label="Clean sheet points"
                values={form.scoring_rules.clean_sheet}
                onChange={(v) => setScoring({ clean_sheet: v })}
              />
            </div>
          </Section>

          <Section title="Scoring — other">
            <div className="grid grid-cols-3 gap-3">
              <Num label="Assist" value={form.scoring_rules.assist} onChange={(v) => setScoring({ assist: v })} />
              <Num label="Played 60+ min" value={form.scoring_rules.played_60_minutes} onChange={(v) => setScoring({ played_60_minutes: v })} />
              <Num label="Player of match" value={form.scoring_rules.player_of_match} onChange={(v) => setScoring({ player_of_match: v })} />
              <Num label="Yellow card" value={form.scoring_rules.yellow_card} onChange={(v) => setScoring({ yellow_card: v })} />
              <Num label="Red card" value={form.scoring_rules.red_card} onChange={(v) => setScoring({ red_card: v })} />
              <Num label="Own goal" value={form.scoring_rules.own_goal} onChange={(v) => setScoring({ own_goal: v })} />
              <Num label="Missed penalty" value={form.scoring_rules.missed_penalty} onChange={(v) => setScoring({ missed_penalty: v })} />
              <Num label="Captain ×" value={form.scoring_rules.captain_multiplier} onChange={(v) => setScoring({ captain_multiplier: v })} />
              <Num label="Triple captain ×" value={form.scoring_rules.triple_captain_multiplier} onChange={(v) => setScoring({ triple_captain_multiplier: v })} />
            </div>
          </Section>

          <Section title="Transfers">
            <div className="grid grid-cols-3 gap-3">
              <Num
                label="Free per round"
                value={form.transfer_rules.free_transfers_per_round}
                min={0}
                onChange={(v) => set({ transfer_rules: { ...form.transfer_rules, free_transfers_per_round: v } })}
              />
              <Num
                label="Max saved"
                value={form.transfer_rules.max_saved_transfers}
                min={0}
                onChange={(v) => set({ transfer_rules: { ...form.transfer_rules, max_saved_transfers: v } })}
              />
              <Num
                label="Extra penalty"
                value={form.transfer_rules.extra_transfer_penalty}
                onChange={(v) => set({ transfer_rules: { ...form.transfer_rules, extra_transfer_penalty: v } })}
              />
            </div>
          </Section>

          <Section title="Chips (uses per season)">
            <div className="grid grid-cols-4 gap-3">
              <Num
                label="Wildcard"
                value={form.chip_rules.wildcard}
                min={0}
                onChange={(v) => set({ chip_rules: { ...form.chip_rules, wildcard: v } })}
              />
              <Num
                label="Free hit"
                value={form.chip_rules.free_hit}
                min={0}
                onChange={(v) => set({ chip_rules: { ...form.chip_rules, free_hit: v } })}
              />
              <Num
                label="Bench boost"
                value={form.chip_rules.bench_boost}
                min={0}
                onChange={(v) => set({ chip_rules: { ...form.chip_rules, bench_boost: v } })}
              />
              <Num
                label="Triple captain"
                value={form.chip_rules.triple_captain}
                min={0}
                onChange={(v) => set({ chip_rules: { ...form.chip_rules, triple_captain: v } })}
              />
            </div>
          </Section>

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
                if (!form.name.trim()) return setError("Name is required");
                mutation.mutate();
              }}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold"
            >
              {mutation.isPending ? "Saving..." : "Save Ruleset"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rulesets tab ─────────────────────────────────────────────────────────────
export default function RulesetsTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<AdminRuleset | "new" | null>(null);

  const { data: rulesets = [], isLoading } = useQuery({
    queryKey: ["admin-rulesets"],
    queryFn: () => adminApi.getRulesets(),
  });

  const toggleMutation = useMutation({
    mutationFn: (r: AdminRuleset) =>
      r.status ? adminApi.deactivateRuleset(r.id) : adminApi.activateRuleset(r.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rulesets"] }),
    onError: (e) => alert(extractApiError(e, "Failed to change status")),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">{rulesets.length} rulesets</p>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold"
        >
          <Plus size={15} />
          New Ruleset
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-2">
          {rulesets.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                <SlidersHorizontal size={16} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{r.name}</p>
                <p className="text-gray-500 text-xs">
                  Budget {r.budget} · Squad {r.squad_size} · Start {r.starting_size} · Max/club {r.max_players_per_club}
                </p>
              </div>
              <button
                onClick={() => toggleMutation.mutate(r)}
                disabled={toggleMutation.isPending}
                className={clsx(
                  "px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0",
                  r.status !== false ? "bg-green-500/15 text-green-400" : "bg-gray-800 text-gray-500"
                )}
                title="Click to toggle"
              >
                {r.status !== false ? "Active" : "Inactive"}
              </button>
              <button
                onClick={() => setModal(r)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
              >
                <Edit2 size={14} />
              </button>
            </div>
          ))}
          {rulesets.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-gray-800 rounded-xl">
              No rulesets yet — create the first one.
            </div>
          )}
        </div>
      )}

      {modal && (
        <RulesetModal ruleset={modal === "new" ? undefined : modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
